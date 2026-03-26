import { InMemorySentryEventStorage } from "test/observability/in-memory-sentry-event-storage";
import { afterEach, beforeEach } from "vitest";

import { getEnv } from "@/infra/env";
import { sentryErrorCaptureGateway } from "@/infra/observability/sentry";

describe("sentryErrorCaptureGateway", () => {
  const originalEnv = process.env;
  const baseTestEnv: NodeJS.ProcessEnv = {
    SENTRY_DSN: undefined,
  };

  const storage = new InMemorySentryEventStorage();

  beforeEach(() => {
    process.env = { ...originalEnv, ...baseTestEnv };
  });

  afterEach(() => {
    sentryErrorCaptureGateway.setSentryEventCallbackForTests();
    sentryErrorCaptureGateway.shutDown();
    storage.clear();
    process.env = originalEnv;
  });

  it("does not capture events when initialized without DSN", async () => {
    expect(getEnv().SENTRY_DSN).toBeUndefined();

    sentryErrorCaptureGateway.setSentryEventCallbackForTests(
      storage.store.bind(storage)
    );
    sentryErrorCaptureGateway.init();

    sentryErrorCaptureGateway.captureHttpError({
      requestId: "req-gw-1",
      method: "GET",
      route: "/health",
      statusCode: 500,
      code: "OPERATION_FAILED",
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(storage.events).toHaveLength(0);
  });

  it("captures sanitized event through gateway when DSN is configured", async () => {
    process.env.SENTRY_DSN = "https://test@example.ingest.sentry.io/1000000";
    expect(getEnv().SENTRY_DSN).toBe(process.env.SENTRY_DSN);

    sentryErrorCaptureGateway.setSentryEventCallbackForTests(
      storage.store.bind(storage)
    );
    sentryErrorCaptureGateway.init();

    sentryErrorCaptureGateway.captureHttpError({
      requestId: "req-gw-2",
      method: "POST",
      route: "/clients",
      statusCode: 503,
      code: "EXTERNAL_SERVICE_FAILED",
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(storage.events).toHaveLength(1);

    const event = storage.events[0];
    const tags = (event.tags as Record<string, unknown>) || {};

    expect(event.message).toBe("HTTP_REQUEST_FAILED");
    expect(tags).toEqual({
      "request.id": "req-gw-2",
      "http.method": "POST",
      "http.route": "/clients",
      "http.status_code": "503",
      code: "EXTERNAL_SERVICE_FAILED",
    });
  });
});
