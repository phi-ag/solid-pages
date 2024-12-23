import { type SeverityLevel } from "@sentry/core";
import { type Toucan } from "toucan-js";

export type Args = unknown[];

export interface Log {
  debug: (...args: Args) => void;
  info: (...args: Args) => void;
  warn: (...args: Args) => void;
  error: (...args: Args) => void;
}

/// see https://github.com/getsentry/sentry-javascript/blob/master/packages/core/src/integrations/captureconsole.ts
const captureError = (sentry: Toucan, args: Args) => {
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

  const message = args.join(" ");
  sentry.captureMessage(message, level, hint);
};

export const createLog = (sentry: Toucan): Log => ({
  debug: (...args: Args) => console.debug("[dbg]", ...args),
  info: (...args: Args) => console.info("[inf]", ...args),
  warn: (...args: Args) => console.warn("[wrn]", ...args),
  error: (...args: Args) => {
    captureError(sentry, args);
    console.error("[err]", ...args);
  }
});
