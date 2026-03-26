import type { NextFunction, Request, Response } from "express";

import { logger } from "@/infra/observability/local-logger";
import { sentryErrorCaptureGateway } from "@/infra/observability/sentry";

export function unexpectedErrorHandler(
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction
) {
  logger.error("request.unexpected_failed", {
    "request.id": request.requestId,
    "http.method": request.method,
    "http.route": request.path,
    "http.status_code": 500,
  });

  sentryErrorCaptureGateway.captureHttpError({
    requestId: request.requestId,
    method: request.method,
    route: request.path,
    statusCode: 500,
    code: "OPERATION_FAILED",
  });

  void error;

  return response.status(500).json({
    code: "OPERATION_FAILED",
    message: "Ocorreu um erro inesperado.",
    data: {},
  });
}
