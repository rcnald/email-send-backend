import type { Response } from "express";
import type { z } from "zod";
import { fromZodError } from "zod-validation-error/v4";

interface ValidationOptions {
  message?: string;
}

export function validateRequest<T>(
  response: Response,
  schema: z.ZodSchema<T>,
  payload: unknown,
  { message = "Dados inválidos" }: ValidationOptions = {}
): T | undefined {
  const result = schema.safeParse(payload);

  if (!result.success) {
    const formattedError = fromZodError(result.error);

    response.status(400).json({
      code: "INVALID_DATA",
      message,
      data: {
        field_errors: formattedError.details.map((detail) => detail.message),
      },
    });

    return undefined;
  }

  return result.data;
}

export function ensureUserId(
  response: Response,
  userId: unknown,
  message = "ID de usuario invalido ou ausente"
): string | undefined {
  if (!userId || typeof userId !== "string") {
    response.status(400).json({
      message,
      data: {},
    });

    return undefined;
  }

  return userId;
}
