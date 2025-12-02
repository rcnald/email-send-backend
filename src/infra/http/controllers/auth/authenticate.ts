import { Request, Response } from "express"
import { z } from "zod"
import { fromZodError } from "zod-validation-error"

import { AuthenticateUseCase } from "@/domain/application/use-cases/user/authenticate"

const authenticateControllerBodySchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

export class AuthenticateController {
  constructor(private authenticateUseCase: AuthenticateUseCase) {}

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
      if (error.code === "INVALID_EMAIL") {
        return response.status(422).json({
          message: error.message,
          data: error.data,
        })
      }

      if (error.code === "INVALID_CREDENTIALS") {
        return response.status(401).json({
          message: error.message,
          data: error.data,
        })
      }

      return response.status(400).json({
        message: "An unexpected error occurred",
        data: {},
      })
    }

    response.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.ENVIRONMENT === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    })

    response.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.ENVIRONMENT === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return response.status(200).json({
      accessToken: result.accessToken,
    })
  }
}
