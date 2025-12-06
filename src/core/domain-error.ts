import { Mutable } from "./types/mutable"

export const ErrorCode = {
  INVALID_ARGUMENT: "InvalidArgument",
  INVALID_RESOURCE: "InvalidResource",
  NOT_FOUND: "NotFound",
  ALREADY_EXISTS: "AlreadyExists",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  OPERATION_FAILED: "OperationFailed",
  EXTERNAL_SERVICE_FAILED: "ExternalServiceFailed",
} as const

export type ErrorCodeType = keyof typeof ErrorCode

export interface DomainErrorData<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  code: ErrorCodeType
  message: string
  data?: Mutable<T>
}

const createError = <C extends ErrorCodeType>(code: C) => {
  return <
    T extends Record<string, unknown> = Record<string, unknown>,
    M extends string = string,
  >(
    message: M,
    data?: T,
  ) =>
    ({
      code,
      message: message as M,
      data: data as Mutable<T>,
    }) satisfies DomainErrorData<T> & { code: C; message: M }
}

type DomainErrorKeys = {
  [K in keyof typeof ErrorCode as (typeof ErrorCode)[K]]: ReturnType<
    typeof createError<K>
  >
}

const generateDomainError = (): DomainErrorKeys => {
  const result: Record<
    string,
    ReturnType<typeof createError<ErrorCodeType>>
  > = {}

  for (const [code, _] of Object.entries(ErrorCode)) {
    const methodName = ErrorCode[code as keyof typeof ErrorCode]
    result[methodName] = createError(code as ErrorCodeType)
  }

  return result as DomainErrorKeys
}

export const DomainError = generateDomainError()
