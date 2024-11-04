import { type IncomingRequestCfProperties } from "@cloudflare/workers-types/experimental";
import { createMiddleware } from "@solidjs/start/middleware";
import { type PlatformProxy } from "wrangler";

type Proxy = PlatformProxy<Env, IncomingRequestCfProperties>;

declare global {
  // eslint-disable-next-line no-var
  var cfPlatformProxy: Proxy;
}

const ensurePlatformProxy = async (): Promise<Proxy> => {
  if (globalThis.cfPlatformProxy) return globalThis.cfPlatformProxy;
  const wrangler = await import("wrangler");
  const proxy = await wrangler.getPlatformProxy<Env>({ persist: true });
  globalThis.cfPlatformProxy = proxy;
  return proxy;
};

export default createMiddleware({
  onRequest: [
    async (event) => {
      if (import.meta.env.DEV && !event.locals.cf) {
        const platformProxy = await ensurePlatformProxy();
        event.locals.cf = {
          env: platformProxy.env
        };
      } else {
        event.locals.cf = event.nativeEvent.context.cf;
      }
    }
  ]
});
