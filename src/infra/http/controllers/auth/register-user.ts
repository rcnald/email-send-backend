import { Request, Response } from "express"
import { z } from "zod"

import { RegisterUserUseCase } from "@/domain/application/use-cases/auth/register-user"
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler"
import { validateRequest } from "@/infra/http/handlers/http-validation"

const registerUserControllerBodySchema = z.object({
  name: z.string().min(3).max(30),
  email: z.email(),
  password: z.string().min(6).max(100),
})

export class RegisterUserController {
  constructor(private registerUserUseCase: RegisterUserUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const body = validateRequest(
      response,
      registerUserControllerBodySchema,
      request.body,
    )

    if (!body) return response

    const { name, email, password } = body

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
