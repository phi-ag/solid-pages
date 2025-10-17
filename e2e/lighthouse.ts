import test, { type BrowserContext, type Page, chromium } from "@playwright/test";
import { playAudit } from "playwright-lighthouse";

import { attachReport, clientCredentials } from "./utils";

const threshold = process.env.LIGHTHOUSE_THRESHOLD
  ? Number(process.env.LIGHTHOUSE_THRESHOLD)
  : 0;

const lighthouse = async (page: Page, name: string) => {
  await playAudit({
    page,
    port: 9222,
    thresholds: {
      performance: threshold,
      accessibility: threshold,
      "best-practices": threshold,
      seo: threshold
    },
    reports: {
      name,
      directory: "reports/lighthouse/",
      formats: {
        json: false,
        html: true
      }
    }
  });

  await attachReport("lighthouse-report", `reports/lighthouse/${name}.html`);
};

test.describe("lighthouse", () => {
  test.describe.configure({ mode: "serial" });

  let context: BrowserContext;

  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext(".playwright/chromium-lighthouse", {
      args: ["--remote-debugging-port=9222", "--ignore-certificate-errors"]
    });
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("home", async () => {
    const page = await context.newPage();
    await clientCredentials(page);

    await page.goto("/");
    await lighthouse(page, "home");
  });
});
