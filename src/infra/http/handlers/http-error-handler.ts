import type { Response } from "express";

import type { DomainErrorData } from "@/core/domain-error";
import { ErrorMapper } from "@/infra/http/mappers/error-mapper";
import { logger } from "@/infra/observability/local-logger";
import { sentryErrorCaptureGateway } from "@/infra/observability/sentry";

export class HttpErrorHandler {
  static handle(response: Response, error: DomainErrorData): Response {
    const errorResponse = ErrorMapper.toHTTP(error);
    const request = response.req;

    logger.error("request.failed", {
      "request.id": request?.requestId,
      "http.method": request?.method,
      "http.route": request?.path,
      "http.status_code": errorResponse.statusCode,
      "error.code": error.code,
      "error.safe_message": error.message,
    });

    if (errorResponse.statusCode >= 500) {
      sentryErrorCaptureGateway.captureHttpError({
        requestId: request?.requestId,
        method: request?.method,
        route: request?.route?.path || request?.path,
        statusCode: errorResponse.statusCode,
        code: error.code,
      });
    }

    return response.status(errorResponse.statusCode).json({
      code: errorResponse.code,
      message: errorResponse.message,
      data: errorResponse.data || {},
    });
  }
}
