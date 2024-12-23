import { HttpHeader } from "@solidjs/start";
import { compact } from "lodash-es";
import { type Component, type JSXElement, Show } from "solid-js";
import { getRequestEvent } from "solid-js/web";

// SECURITY: seroval requires 'unsafe-eval'
const scripts = (nonce: string): string =>
  [
    "script-src",
    "'self'",
    "https://static.cloudflareinsights.com",
    "'unsafe-eval'",
    `'nonce-${nonce}'`
  ].join(" ");

// SECURITY: Safari requires 'unsafe-inline'
const styles = "style-src 'self' 'unsafe-inline'";

const frame = "frame-src 'self'";

const frameAncestors = [
  "frame-ancestors",
  import.meta.env.DEV ? "https://*.github.dev" : "'none'"
].join(" ");

const fonts = "font-src 'self' data:";

const images = "img-src 'self' https: data: blob:";

const connect = compact([
  "connect-src",
  "'self'",
  "https://cloudflareinsights.com",
  import.meta.env.DEV && "data: *"
]).join(" ");

const worker = "worker-src 'self'";

const media = "media-src 'self' data:";

const csp = (nonce: string): string =>
  [
    "default-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "manifest-src 'self'",
    scripts(nonce),
    styles,
    frame,
    frameAncestors,
    fonts,
    images,
    connect,
    worker,
    media
  ].join(";");

const CspHeader: Component = () => {
  // @ts-expect-error
  const nonce = getRequestEvent()?.nonce;
  return <HttpHeader name="Content-Security-Policy" value={csp(nonce)} />;
};

const StrictTransportSecurity = (): JSXElement => {
  const url = getRequestEvent()?.request?.url;
  const protocol = url ? new URL(url).protocol : undefined;

  return (
    <Show when={protocol === "https:"}>
      <HttpHeader
        name="Strict-Transport-Security"
        value="max-age=31536000; includeSubDomains"
      />
    </Show>
  );
};

export const SecurityHeader: Component = () => (
  <>
    <CspHeader />
    <HttpHeader name="X-Content-Type-Options" value="nosniff" />
    <HttpHeader name="X-Frame-Options" value="DENY" />
    <HttpHeader name="X-XSS-Protection" value="1; mode=block" />
    <HttpHeader name="Referrer-Policy" value="strict-origin" />
    <HttpHeader
      name="Permissions-Policy"
      value="geolocation=(self), camera=(self), fullscreen=(self), microphone=(self)"
    />
    <StrictTransportSecurity />
  </>
);
