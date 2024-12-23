import { expect, test } from "@playwright/test";

import { clientCredentials, throwOnConsoleError } from "./utils";

test.describe("e2e", () => {
  test("title", async ({ page }) => {
    throwOnConsoleError(page);
    await clientCredentials(page);

    await page.goto("/");
    await expect(page).toHaveTitle(/Solid Pages/);
  });
});
