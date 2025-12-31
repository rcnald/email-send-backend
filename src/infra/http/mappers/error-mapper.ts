import { DomainErrorData, ErrorCodeType } from "@/core/domain-error"

export interface ErrorResponse {
  statusCode: number
  code: ErrorCodeType
  message: string
  data?: Record<string, unknown>
}

export class ErrorMapper {
  static toHTTP(error: DomainErrorData): ErrorResponse {
    const mapping: Record<ErrorCodeType, number> = {
      INVALID_ARGUMENT: 400,
      INVALID_RESOURCE: 422,
      NOT_FOUND: 404,
      ALREADY_EXISTS: 409,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      OPERATION_FAILED: 400,
      EXTERNAL_SERVICE_FAILED: 503,
    }

    const statusCode = mapping[error.code] || 400

    return {
      statusCode,
      code: error.code,
      message: error.message,
      data: error.data,
    }
  }
}
