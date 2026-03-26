import {
  captureException,
  close,
  type ErrorEvent,
  init as sentryInit,
} from "@sentry/node";

import type {
  CaptureHttpErrorInput,
  ErrorCaptureGateway,
} from "@/domain/application/observability/error-capture";
import { getEnv } from "@/infra/env";

const EVENT_MESSAGE = "HTTP_REQUEST_FAILED";
const SAFE_TAGS = [
  "request.id",
  "http.method",
  "http.route",
  "http.status_code",
  "code",
] as const;

class SentryErrorCaptureGateway implements ErrorCaptureGateway {
  private enabled = true;
  private eventCallbackForTests?: (event: ErrorEvent) => void;

  init() {
    const env = getEnv();

    if (!env.SENTRY_DSN) {
      this.enabled = false;
      return;
    }

    const options = {
      dsn: env.SENTRY_DSN,
      sendDefaultPii: false,
      beforeSend: (event: ErrorEvent) => {
        const sanitizedEvent = this.sanitizeEvent(event);

        if (this.eventCallbackForTests) {
          this.eventCallbackForTests(sanitizedEvent);
          return null;
        }

        return sanitizedEvent;
      },
    };

    sentryInit(options as never);

    this.enabled = true;
  }

  captureHttpError(input: CaptureHttpErrorInput) {
    if (!this.enabled) {
      return;
    }

    const syntheticError = new Error(EVENT_MESSAGE);
    syntheticError.stack = undefined;

    captureException(syntheticError, {
      tags: {
        "request.id": input.requestId,
        "http.method": input.method,
        "http.route": input.route,
        "http.status_code": String(input.statusCode),
        code: input.code,
      },
    });
  }

  shutDown(): void {
    close(0);
  }

  setSentryEventCallbackForTests(callback?: (event: ErrorEvent) => void): void {
    this.eventCallbackForTests = callback;
  }

  private sanitizeEvent(event: ErrorEvent): ErrorEvent {
    const safeTags = SAFE_TAGS.reduce<Record<string, string>>((acc, key) => {
      const tagValue = event.tags?.[key];

      if (tagValue === undefined || tagValue === null) {
        return acc;
      }

      acc[key] = String(tagValue);
      return acc;
    }, {});

    return {
      type: event.type,
      event_id: event.event_id,
      message: EVENT_MESSAGE,
      level: "error",
      tags: safeTags,
    };
  }
}

export const sentryErrorCaptureGateway = new SentryErrorCaptureGateway();
