import { Request, Response } from "express"
import z from "zod"
import { fromZodError } from "zod-validation-error/v4"

import { CreateClientUseCase } from "@/domain/application/use-cases/client/create-client"
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler"

const createClientControllerBodySchema = z.object({
  name: z.string().min(2).max(100),
  CNPJ: z.string().min(14).max(14),
  accountant_email: z.email(),
  accountant_name: z.string().min(2).max(100),
})

export class CreateClientController {
  constructor(private createClientUseCase: CreateClientUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const userId = request.userId

    if (!userId || typeof userId !== "string") {
      return response.status(400).json({
        message: "Invalid or missing user ID",
        data: {},
      })
    }

    const bodyValidation = createClientControllerBodySchema.safeParse(
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

    const { name, CNPJ, accountant_name, accountant_email } =
      bodyValidation.data

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
