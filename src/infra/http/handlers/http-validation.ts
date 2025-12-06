import { Response } from "express"
import { z } from "zod"
import { fromZodError } from "zod-validation-error/v4"

interface ValidationOptions {
  message?: string
}

export function validateRequest<T>(
  response: Response,
  schema: z.ZodSchema<T>,
  payload: unknown,
  { message = "Invalid request body" }: ValidationOptions = {},
): T | undefined {
  const result = schema.safeParse(payload)

  if (!result.success) {
    const formattedError = fromZodError(result.error)

    response.status(400).json({
      message,
      data: {
        field_errors: formattedError.details,
      },
    })

    return undefined
  }

  return result.data
}

export function ensureUserId(
  response: Response,
  userId: unknown,
  message = "Invalid or missing user ID",
): string | undefined {
  if (!userId || typeof userId !== "string") {
    response.status(400).json({
      message,
      data: {},
    })

    return undefined
  }

  return userId
}
