import type { Response } from "express";

import type { DomainErrorData } from "@/core/domain-error";
import { ErrorMapper } from "@/infra/http/mappers/error-mapper";
import { logger } from "@/infra/logger/local";

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

    return response.status(errorResponse.statusCode).json({
      code: errorResponse.code,
      message: errorResponse.message,
      data: errorResponse.data || {},
    });
  }
}
