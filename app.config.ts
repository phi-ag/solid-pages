import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

import { version } from "./package.json";

const revision = process.env.GITHUB_SHA?.slice(0, 7) ?? "deadbeef";

export default defineConfig({
  middleware: "./src/middleware.ts",
  server: {
    preset: "cloudflare-pages",
    compatibilityDate: "2024-11-03"
  },
  vite: {
    plugins: [tailwindcss()],
    define: {
      "import.meta.env.VERSION": JSON.stringify(version),
      "import.meta.env.REVISION": JSON.stringify(revision)
    }
  }
});
