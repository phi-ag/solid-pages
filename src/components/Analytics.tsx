import { Component, Show } from "solid-js";
import { getRequestEvent } from "solid-js/web";

const Analytics: Component = () => {
  const event = getRequestEvent();

  // @ts-ignore
  const nonce = event?.nonce;
  const token = event?.locals.env.ANALYTICS_TOKEN;
  const data = token ? `{"token": "${token}"}` : undefined;

  const hostname = event ? new URL(event.request.url).hostname : undefined;

  return (
    <Show when={hostname !== "localhost" && nonce && data}>
      <script
        defer
        async
        nonce={nonce}
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon={data}
      />
    </Show>
  );
};

export default Analytics;