import { Request, Response } from "express"
import z from "zod"
import { fromZodError } from "zod-validation-error/v4"

import { SendEmailUseCase } from "@/domain/application/use-cases/send-email"

const sentEmailControllerBodySchema = z.object({
  clientId: z.uuid(),
  attachmentIds: z.array(z.uuid()),
})

export class SentEmailController {
  constructor(private sentEmailUseCase: SendEmailUseCase) {}

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

    const [error, result, warn] = await this.sentEmailUseCase.execute({
      attachmentIds,
      clientId,
    })

    if (error) {
      if (error.code === "CLIENT_NOT_FOUND") {
        return response.status(404).json({ error: error.message })
      }

      if (error.code === "SOME_ATTACHMENTS_NOT_FOUND") {
        return response
          .status(404)
          .json({ error: error.message, missingIds: error.missingIds })
      }

      if (error.code === "ATTACHMENTS_HAS_EXPIRED") {
        return response.status(410).json({ error: error.message })
      }

      if (error.code === "FAILED_TO_PROCESS_ATTACHMENTS") {
        return response.status(400).json({
          error: error.message,
          details: error.details,
        })
      }

      if (error.code === "FAILED_TO_SEND_EMAIL") {
        return response.status(500).json({ error: error.message })
      }

      return response.status(400).json({ error: "bad request" })
    }

    if (warn) {
      return response.status(400).json({
        warning: warn.message,
        attachments: result.map((attachment) => ({
          filename: attachment.filename,
        })),
        details: warn.details,
      })
    }

    return response.status(200).json({ message: "Email sent successfully" })
  }
}
