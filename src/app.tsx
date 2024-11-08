import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import { AppErrorBoundary } from "~/components";
import { ThemeProvider } from "~/lib/theme";

import "./app.css";

export default function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <Router root={(props) => <Suspense>{props.children}</Suspense>}>
          <FileRoutes />
        </Router>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
