import type { Express } from "express";
import request from "supertest";
import { InMemorySentryEventStorage } from "test/observability/in-memory-sentry-event-storage";
import { createApp } from "@/infra/app";
import { sentryErrorCaptureGateway } from "@/infra/observability/sentry";

describe("unexpectedErrorHandler e2e", () => {
  const originalEnv = process.env;
  const storage = new InMemorySentryEventStorage();

  const registerTestRoutes = (app: Express) => {
    app.get("/__test/unexpected-throw", () => {
      throw new Error("boom");
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

  it("captures unexpected throw and returns safe 500 response", async () => {
    const app = createApp({ registerTestRoutes });

    const response = await request(app).get("/__test/unexpected-throw");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      code: "OPERATION_FAILED",
      message: "Ocorreu um erro inesperado.",
      data: {},
    });
    expect(JSON.stringify(response.body)).not.toContain("boom");

    expect(storage.events).toHaveLength(1);

    const event = storage.events[0];
    const tags = (event.tags as Record<string, unknown>) || {};

    expect(event.message).toBe("HTTP_REQUEST_FAILED");
    expect(tags).toMatchObject({
      "http.method": "GET",
      "http.route": "/__test/unexpected-throw",
      "http.status_code": "500",
      code: "OPERATION_FAILED",
    });
    expect(tags).toHaveProperty("request.id");
    expect(JSON.stringify(event)).not.toContain("boom");
  });
});
