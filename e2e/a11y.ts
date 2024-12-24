import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";
import type axe from "axe-core";
import { createHtmlReport } from "axe-html-reporter";

import { attachReport, clientCredentials, throwOnConsoleError } from "./utils";

const htmlReport = async (name: string, results: axe.AxeResults) => {
  const reportFileName = `${test.info().project.name}-${name}.html`;

  createHtmlReport({
    results,
    options: {
      outputDir: "reports/a11y",
      reportFileName
    }
  });

  return `reports/a11y/${reportFileName}`;
};

const a11y = async (name: string, page: Page) => {
  const results = await new AxeBuilder({ page }).analyze();
  const path = await htmlReport(name, results);
  await attachReport("axe-report", path);

  return results;
};

test.describe("accessibility", () => {
  test.describe.configure({ mode: "serial" });

  test("home", async ({ page }) => {
    throwOnConsoleError(page);
    await clientCredentials(page);

    await page.goto("/");
    const results = await a11y("home", page);
    expect(results.violations).toEqual([]);
  });
});
