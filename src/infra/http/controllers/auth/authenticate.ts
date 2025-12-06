import { Request, Response } from "express"
import { z } from "zod"
import { fromZodError } from "zod-validation-error"

import { AuthenticateUseCase } from "@/domain/application/use-cases/auth/authenticate"
import { Env, getEnv } from "@/infra/env"
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler"

const authenticateControllerBodySchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

export class AuthenticateController {
  constructor(
    private authenticateUseCase: AuthenticateUseCase,
    private env: Env = getEnv(),
  ) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const bodyValidation = authenticateControllerBodySchema.safeParse(
      request.body,
    )

    if (!bodyValidation.success) {
      const formattedError = fromZodError(bodyValidation.error)

      return response.status(400).json({
        message: "Invalid request body",
        data: {
          field_errors: formattedError.details,
        },
      })
    }

    const { email, password } = bodyValidation.data

    const [error, result] = await this.authenticateUseCase.execute({
      email,
      password,
    })

    if (error) {
      return HttpErrorHandler.handle(response, error)
    }

    response.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: this.env.ENVIRONMENT === "production",
      sameSite: "strict",
      maxAge: this.env.JWT_ACCESS_TOKEN_MAX_AGE,
    })

    response.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: this.env.ENVIRONMENT === "production",
      sameSite: "strict",
      maxAge: this.env.JWT_REFRESH_TOKEN_MAX_AGE,
    })

    return response.status(200).json()
  }
}
