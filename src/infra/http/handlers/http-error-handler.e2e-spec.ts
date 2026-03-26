import type { Express } from "express";
import request from "supertest";
import { InMemorySentryEventStorage } from "test/observability/in-memory-sentry-event-storage";
import { DomainError } from "@/core/domain-error";
import { createApp } from "@/infra/app";
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler";
import { sentryErrorCaptureGateway } from "@/infra/observability/sentry";

describe("httpErrorHandler e2e", () => {
  const originalEnv = process.env;
  const storage = new InMemorySentryEventStorage();

  const registerTestRoutes = (app: Express) => {
    app.get("/__test/domain-400", (_request, response) => {
      return HttpErrorHandler.handle(
        response,
        DomainError.InvalidArgument("invalid argument")
      );
    });

    app.get("/__test/domain-503", (_request, response) => {
      return HttpErrorHandler.handle(
        response,
        DomainError.ExternalServiceFailed("upstream timeout", {
          token: "sensitive-value",
        })
      );
    });
  };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SENTRY_DSN: "https://test@example.ingest.sentry.io/1000000",
    };

    sentryErrorCaptureGateway.setSentryEventCallbackForTests(
      storage.store.bind(storage)
    );
    sentryErrorCaptureGateway.init();
  });

  afterEach(() => {
    sentryErrorCaptureGateway.setSentryEventCallbackForTests();
    sentryErrorCaptureGateway.shutDown();
    storage.clear();
    process.env = originalEnv;
  });

  it("does not capture sentry event for 4xx domain error", async () => {
    const app = createApp({ registerTestRoutes });

    const response = await request(app).get("/__test/domain-400");

    expect(response.status).toBe(400);
    expect(storage.events).toHaveLength(0);
  });

  it("captures sanitized sentry event for 5xx domain error", async () => {
    const app = createApp({ registerTestRoutes });

    const response = await request(app).get("/__test/domain-503");

    expect(response.status).toBe(503);
    expect(storage.events).toHaveLength(1);

    const event = storage.events[0];
    const tags = (event.tags as Record<string, unknown>) || {};

    expect(event.message).toBe("HTTP_REQUEST_FAILED");
    expect(tags).toMatchObject({
      "http.method": "GET",
      "http.route": "/__test/domain-503",
      "http.status_code": "503",
      code: "EXTERNAL_SERVICE_FAILED",
    });
    expect(tags).toHaveProperty("request.id");

    expect(event.request).toBeUndefined();
    expect(event.extra).toBeUndefined();
    expect(event.exception).toBeUndefined();
    expect(event.message).not.toContain("upstream timeout");
    expect(JSON.stringify(event)).not.toContain("sensitive-value");
  });
});
