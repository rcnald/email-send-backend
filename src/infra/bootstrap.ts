import type { Express } from "express";

import { createApp } from "@/infra/app";
import { getEnv } from "@/infra/env";
import { logger } from "@/infra/observability/local-logger";
import { sentryErrorCaptureGateway } from "@/infra/observability/sentry";

interface StartServerListenInput {
  app: Express;
  port: number;
  onListen: () => void;
}

interface StartServerDeps {
  initErrorCapture?: () => void;
  createApp?: () => Express;
  getEnv?: () => { PORT: number };
  listen?: (input: StartServerListenInput) => void;
  logServerStarted?: (port: number) => void;
}

export function startServer(deps: StartServerDeps = {}): void {
  const initErrorCapture =
    deps.initErrorCapture ?? (() => sentryErrorCaptureGateway.init());
  const buildApp = deps.createApp ?? createApp;
  const readEnv = deps.getEnv ?? getEnv;
  const listen =
    deps.listen ??
    ((input: StartServerListenInput) => {
      input.app.listen(input.port, input.onListen);
    });
  const logServerStarted =
    deps.logServerStarted ??
    ((port: number) => {
      logger.info("server.started", {
        port,
        reference_url: `http://localhost:${port}/reference`,
      });
    });

  initErrorCapture();

  const app = buildApp();
  const env = readEnv();

  listen({
    app,
    port: env.PORT,
    onListen: () => {
      logServerStarted(env.PORT);
    },
  });
}
