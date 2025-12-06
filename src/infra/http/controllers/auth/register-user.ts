import { Request, Response } from "express"
import { z } from "zod"
import { fromZodError } from "zod-validation-error"

import { RegisterUserUseCase } from "@/domain/application/use-cases/auth/register-user"
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler"

const registerUserControllerBodySchema = z.object({
  name: z.string().min(3).max(30),
  email: z.email(),
  password: z.string().min(6).max(100),
})

export class RegisterUserController {
  constructor(private registerUserUseCase: RegisterUserUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const bodyValidation = registerUserControllerBodySchema.safeParse(
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

    const { name, email, password } = bodyValidation.data

    const [error] = await this.registerUserUseCase.execute({
      name,
      email,
      password,
    })

    if (error) {
      return HttpErrorHandler.handle(response, error)
    }

    return response.status(201).json()
  }
}
