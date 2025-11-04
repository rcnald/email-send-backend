import { Request, Response } from "express"
import z from "zod"
import { fromZodError } from "zod-validation-error/v4"

import { CreateClientUseCase } from "@/domain/application/use-cases/create-client"

const createClientControllerBodySchema = z.object({
  name: z.string().min(2).max(100),
  CNPJ: z.string().min(14).max(14),
  accountant_email: z.email(),
  accountant_name: z.string().min(2).max(100),
})

export class CreateClientController {
  constructor(private createClientUseCase: CreateClientUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
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
      name,
      CNPJ,
      accountant: {
        name: accountant_name,
        email: accountant_email,
      },
    })

    if (error) {
      if (error.code === "CLIENT_ALREADY_EXISTS") {
        return response.status(409).json({
          message: "Client already exists",
          data: {
            CNPJ: error.data.CNPJ,
          },
        })
      }

      if (error.code === "INVALID_EMAIL") {
        return response.status(422).json({
          message: "Invalid email provided",
          data: {
            email: error.data.email,
          },
        })
      }

      return response.status(400).json({
        message: "An unexpected error occurred",
        data: {},
      })
    }

    return response.status(201).json()
  }
}
