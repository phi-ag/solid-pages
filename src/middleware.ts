import { redirect } from "@solidjs/router";
import { createMiddleware } from "@solidjs/start/middleware";
import { type FetchEvent } from "@solidjs/start/server";
import { type Toucan } from "toucan-js";
import { sendWebResponse } from "vinxi/http";
import { type PlatformProxy } from "wrangler";

import { tryGetUser } from "~/lib/jwt";
import { type Log, createLog } from "~/lib/log";
import { createSentry } from "~/lib/sentry";

type Proxy = PlatformProxy<Env, IncomingRequestCfProperties>;

interface CacheStorage {
  open(cacheName: string): Promise<Cache>;
  readonly default: Cache;
}

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
    log: Log;
    user?: string;
  }
}

const ensurePlatformProxy = async (): Promise<Proxy> => {
  if (globalThis.cfPlatformProxy) return globalThis.cfPlatformProxy;
  const wrangler = await import("wrangler");
  const proxy = await wrangler.getPlatformProxy<Env>({ persist: true });
  globalThis.cfPlatformProxy = proxy;
  return proxy;
};

const cloudflare = async (event: FetchEvent): Promise<void> => {
  if (import.meta.env.DEV) {
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

const redirectToDomain = (event: FetchEvent): Response | undefined => {
  if (import.meta.env.DEV) return;

  const domain = event.locals.env.DOMAIN;
  const url = new URL(event.request.url);

  if (url.hostname !== "localhost" && url.host !== domain) {
    url.host = domain;
    url.protocol = "https:";
    return redirect(url.href);
  }
};

const sentry = (event: FetchEvent): void => {
  event.locals.sentry = createSentry(event);
  event.locals.log = createLog(event.locals.sentry);
};

const user = async (event: FetchEvent): Promise<Response | undefined> => {
  if (!event.locals.env.JWT_ISSUER) return;

  const user = await tryGetUser(event);
  if (!user) {
    await sendWebResponse(new Response("Unauthorized", { status: 401 }));
    return;
  }

  event.locals.user = user;
};

export default createMiddleware({
  onRequest: [cloudflare, redirectToDomain, sentry, user]
});
