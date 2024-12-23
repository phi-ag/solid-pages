import { createAsync, query } from "@solidjs/router";
import { Suspense } from "solid-js";
import { getRequestEvent } from "solid-js/web";

const getData = query(async () => {
  "use server";

  const event = getRequestEvent();
  if (!event) throw Error("Missing event");

  const env = event.locals.env;

  const user = event.locals.user;
  const metadata = env.CF_VERSION_METADATA;
  const environment = env.ENVIRONMENT;

  const kvKey = "test";
  await env.KV.put(kvKey, "value");
  const kv = await env.KV.get(kvKey);

  const r2Key = "test";
  await env.R2.put(r2Key, "Hello, World!");
  const r2 = await env.R2.get(r2Key);

  const d1 = await env.DB.prepare("SELECT 1;").all();

  const cache = await event.locals.caches.default.match("https://example.com");

  return {
    user,
    metadata,
    environment,
    kv,
    r2: {
      key: r2?.key,
      size: r2?.size,
      etag: r2?.etag
    },
    d1,
    cache
  };
}, "data");

export const route = {
  preload: () => getData()
};

export default function Home() {
  const data = createAsync(() => getData());

  return (
    <main class="flex flex-1 overflow-hidden">
      <div class="flex flex-1 flex-col items-center gap-2 overflow-y-auto overflow-x-clip px-2 py-4">
        <h1 class="text-2xl">Hello</h1>
        <Suspense fallback="Loading...">
          <pre class="text-sm">{JSON.stringify(data(), null, 2)}</pre>
        </Suspense>
      </div>
    </main>
  );
}
