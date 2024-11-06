import {
  type CacheStorage,
  type IncomingRequestCfProperties
} from "@cloudflare/workers-types/experimental";
import { redirect } from "@solidjs/router";
import { createMiddleware } from "@solidjs/start/middleware";
import { type FetchEvent } from "@solidjs/start/server";
import { type Toucan } from "toucan-js";
import { type PlatformProxy } from "wrangler";

import { createSentry } from "~/lib/sentry";

type Proxy = PlatformProxy<Env, IncomingRequestCfProperties>;

declare global {
  // eslint-disable-next-line no-var
  var cfPlatformProxy: Proxy;
}

declare module "@solidjs/start/server" {
  interface RequestEventLocals {
    cf: IncomingRequestCfProperties;
    env: Env;
    caches: CacheStorage;
    waitUntil: (promise: Promise<unknown>) => void;
    passThroughOnException: () => void;
    sentry: Toucan;
  }
}

const ensurePlatformProxy = async (): Promise<Proxy> => {
  if (globalThis.cfPlatformProxy) return globalThis.cfPlatformProxy;
  const wrangler = await import("wrangler");
  const proxy = await wrangler.getPlatformProxy<Env>({ persist: true });
  globalThis.cfPlatformProxy = proxy;
  return proxy;
};

const cloudflare = async (event: FetchEvent) => {
  if (import.meta.env.DEV && !event.locals.cf) {
    const platformProxy = await ensurePlatformProxy();
    event.locals.cf = platformProxy.cf;
    event.locals.env = platformProxy.env;
    event.locals.caches = platformProxy.caches as unknown as CacheStorage;
    event.locals.waitUntil = platformProxy.ctx.waitUntil;
    event.locals.passThroughOnException = platformProxy.ctx.passThroughOnException;
  } else {
    const context = event.nativeEvent.context;
    event.locals.cf = context.cf;
    event.locals.env = context.cloudflare.env;
    event.locals.caches = caches as unknown as CacheStorage;
    event.locals.waitUntil = context.waitUntil;
    event.locals.passThroughOnException = context.passThroughOnException;
  }
};

const redirectToDomain = async (event: FetchEvent) => {
  if (import.meta.env.DEV) return;

  const domain = event.locals.env.DOMAIN;
  const url = new URL(event.request.url);

  if (url.host !== domain) {
    url.host = domain;
    url.protocol = "https:";
    url.port = "443";
    return redirect(url.href);
  }
};

const sentry = async (event: FetchEvent) => {
  if (!event.locals.sentry) {
    event.locals.sentry = createSentry(event);
  }
};

export default createMiddleware({
  onRequest: [cloudflare, redirectToDomain, sentry]
});
