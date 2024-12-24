import test, { type Page } from "@playwright/test";

export const throwOnConsoleError = (page: Page): void => {
  page.on("console", (message) => {
    if (message.type() === "error") throw message;
    if (message.type() === "warning") console.warn(message);
  });

  page.on("pageerror", (error) => {
    throw error;
  });
};

export const clientCredentials = async (page: Page): Promise<void> => {
  await page.route(`${process.env.BASE_URL}/**`, async (route, request) => {
    const headers = {
      ...request.headers(),
      "CF-Access-Client-Id": process.env.E2E_CLIENT_ID,
      "CF-Access-Client-Secret": process.env.E2E_CLIENT_SECRET
    };
    // @ts-expect-error
    await route.continue({ headers });
  });
};

/// NOTE: currently forced download, see https://github.com/microsoft/playwright/pull/33267
export const attachReport = (name: string, path: string): Promise<void> =>
  test.info().attach(name, {
    path,
    contentType: "text/html"
  });
