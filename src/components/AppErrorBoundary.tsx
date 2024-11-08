import { HttpStatusCode } from "@solidjs/start";
import { ErrorBoundary, type ParentComponent } from "solid-js";
import { getRequestEvent, isServer } from "solid-js/web";

const captureException = (error: Error) => {
  "use server";
  const event = getRequestEvent();
  if (!event) return;
  event.locals.sentry.captureException(error);
};

const AppErrorBoundary: ParentComponent = (props) => {
  const onError = (error: Error) => {
    if (import.meta.env.DEV) throw error;

    console.error(error);
    captureException(error);

    const message = isServer
      ? "500 | Internal Server Error"
      : "Error | Uncaught Client Exception";

    return (
      <>
        <div class="flex flex-1 items-center justify-center text-xl">{message}</div>
        <HttpStatusCode code={500} />
      </>
    );
  };

  return <ErrorBoundary fallback={onError}>{props.children}</ErrorBoundary>;
};

export default AppErrorBoundary;
