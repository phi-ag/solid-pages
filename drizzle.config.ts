import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/b8fc986c5578b035d217a1824a7ba65fd33847b59ade545a384db45d11f7fb14.sqlite"
  }
} satisfies Config;
