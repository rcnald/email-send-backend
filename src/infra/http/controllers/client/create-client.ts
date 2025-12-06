import { Request, Response } from "express"
import z from "zod"

import { CreateClientUseCase } from "@/domain/application/use-cases/client/create-client"
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler"
import {
  ensureUserId,
  validateRequest,
} from "@/infra/http/handlers/http-validation"

const createClientControllerBodySchema = z.object({
  name: z.string().min(2).max(100),
  CNPJ: z.string().min(14).max(14),
  accountant_email: z.email(),
  accountant_name: z.string().min(2).max(100),
})

export class CreateClientController {
  constructor(private createClientUseCase: CreateClientUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const userId = ensureUserId(response, request.userId)

    if (!userId) return response

    const body = validateRequest(
      response,
      createClientControllerBodySchema,
      request.body,
    )

    if (!body) return response

    const { name, CNPJ, accountant_name, accountant_email } = body

    const [error] = await this.createClientUseCase.execute({
      helperId: userId,
      name,
      CNPJ,
      accountant: {
        name: accountant_name,
        email: accountant_email,
      },
    })

    if (error) {
      return HttpErrorHandler.handle(response, error)
    }

    return response.status(201).json()
  }
}
