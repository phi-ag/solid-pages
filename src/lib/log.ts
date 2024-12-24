import * as util from "node:util";

import { type SeverityLevel } from "@sentry/core";
import { type Toucan } from "toucan-js";

export type Args = unknown[];

export interface Log {
  debug: (...args: Args) => void;
  info: (...args: Args) => void;
  warn: (...args: Args) => void;
  error: (...args: Args) => void;
}

/// see https://github.com/getsentry/sentry-javascript/blob/master/packages/node/src/integrations/console.ts
const addBreadcrumb = (sentry: Toucan, level: SeverityLevel, args: Args): Toucan =>
  sentry.addBreadcrumb({
    category: "console",
    level,
    message: util.format(args)
  });

/// see https://github.com/getsentry/sentry-javascript/blob/master/packages/core/src/integrations/captureconsole.ts
const captureError = (sentry: Toucan, args: Args): void => {
  const level = "error" as SeverityLevel;

  const hint = {
    captureContext: {
      level,
      extra: {
        arguments: args
      }
    }
  };

  const error = args.find((arg) => arg instanceof Error);
  if (error) {
    sentry.captureException(error, hint);
    return;
  }

  const message = util.format(args);
  sentry.captureMessage(message, level, hint);
};

export const createLog = (sentry: Toucan): Log => ({
  debug: (...args: Args) => {
    addBreadcrumb(sentry, "debug", args);
    console.debug(...args);
  },
  info: (...args: Args) => {
    addBreadcrumb(sentry, "info", args);
    console.info(...args);
  },
  warn: (...args: Args) => {
    addBreadcrumb(sentry, "warning", args);
    console.warn(...args);
  },
  error: (...args: Args) => {
    captureError(sentry, args);
    console.error(...args);
  }
});
