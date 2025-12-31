import { Response } from "express"

import { DomainErrorData } from "@/core/domain-error"
import { ErrorMapper } from "@/infra/http/mappers/error-mapper"

export class HttpErrorHandler {
  static handle(response: Response, error: DomainErrorData): Response {
    const errorResponse = ErrorMapper.toHTTP(error)

    return response.status(errorResponse.statusCode).json({
      code: errorResponse.code,
      message: errorResponse.message,
      data: errorResponse.data || {},
    })
  }
}
