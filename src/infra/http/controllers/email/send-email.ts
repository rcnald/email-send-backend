import { Request, Response } from "express"
import z from "zod"
import { fromZodError } from "zod-validation-error/v4"

import { SendEmailUseCase } from "@/domain/application/use-cases/email/send-email"
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler"

const sentEmailControllerBodySchema = z.object({
  client_id: z.uuid(),
  attachment_ids: z.array(z.uuid()),
})

export class SentEmailController {
  constructor(private sentEmailUseCase: SendEmailUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const userId = request.userId

    if (!userId || typeof userId !== "string") {
      return response.status(400).json({
        message: "Invalid or missing user ID",
        data: {},
      })
    }

    const bodyValidation = sentEmailControllerBodySchema.safeParse(request.body)

    if (!bodyValidation.success) {
      const formattedError = fromZodError(bodyValidation.error)

      return response.status(400).json({
        message: "Invalid request body",
        data: {
          field_errors: formattedError.details,
        },
      })
    }

    const { attachment_ids, client_id } = bodyValidation.data

    const [error, result] = await this.sentEmailUseCase.execute({
      helperId: userId,
      attachmentIds: attachment_ids,
      clientId: client_id,
    })

    if (error) {
      return HttpErrorHandler.handle(response, error)
    }

    return response.status(200).json({
      message: "Email sent successfully",
      data: {
        email_id: result.mailId.value,
      },
    })
  }
}
