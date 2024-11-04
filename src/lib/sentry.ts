import { type FetchEvent } from "@solidjs/start/server";
import { Toucan, rewriteFramesIntegration } from "toucan-js";

export const createSentry = (event: FetchEvent): Toucan => {
  const request = event.request;
  const env = event.locals.env;
  const context = { waitUntil: event.locals.waitUntil };

  const release = `${import.meta.env.VERSION}-${import.meta.env.REVISION}`;

  const sentry = new Toucan({
    dsn: env.SENTRY_DSN,
    release,
    enabled: !import.meta.env.DEV,
    environment: env.ENVIRONMENT,
    context,
    request,
    integrations: [rewriteFramesIntegration({ root: "/" })]
  });

  const ip = request.headers.get("cf-connecting-ip") ?? "0.0.0.0";
  const userAgent = request.headers.get("user-agent") ?? "";
  const colo = event.locals.cf.colo ?? "UNKNOWN";

  const geo = {
    country_code: event.locals.cf.country,
    city: event.locals.cf.city
  };

  sentry.setUser({ ip_address: ip, geo, userAgent, colo });
  sentry.setTag("colo", colo);
  sentry.setTag("version_id", env.CF_VERSION_METADATA.id);

  return sentry;
};
