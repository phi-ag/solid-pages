import { defineConfig } from "@solidjs/start/config";

import { revision, version } from "./utils/version.js";

export default defineConfig({
  middleware: "./src/middleware.ts",
  server: {
    preset: "cloudflare-pages",
    compatibilityDate: "2024-11-03"
  },
  vite: {
    define: {
      ...Object.fromEntries(
        [
          ["VERSION", version],
          ["REVISION", revision]
        ].map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)])
      )
    }
  }
});
