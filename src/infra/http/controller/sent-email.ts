import { Request, Response } from "express"
import z from "zod"
import { fromZodError } from "zod-validation-error/v4"

import { SentEmailUseCase } from "@/domain/application/use-cases/sent-email"

const sentEmailControllerBodySchema = z.object({
  clientId: z.uuid(),
  attachmentIds: z.array(z.uuid()),
})

export class SentEmailController {
  constructor(private sentEmailUseCase: SentEmailUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const bodyValidation = sentEmailControllerBodySchema.safeParse(request.body)

    if (!bodyValidation.success) {
      const formattedError = fromZodError(bodyValidation.error)

      return response.status(400).json({
        error: "Invalid body format",
        details: formattedError.details,
      })
    }

    const { clientId, attachmentIds } = bodyValidation.data

    const [error] = await this.sentEmailUseCase.execute({
      attachmentIds,
      clientId,
    })

    if (error) {
      return response.status(400).json({ error: error.message })
    }

    return response.status(200).json({ message: "Email sent successfully" })
  }
}
