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
        message: "Invalid request body",
        data: {
          field_errors: formattedError.details,
        },
      })
    }

    const { clientId, attachmentIds } = bodyValidation.data

    const [error, result] = await this.sentEmailUseCase.execute({
      attachmentIds,
      clientId,
    })

    if (error) {
      if (error.code === "CLIENT_NOT_FOUND") {
        return response.status(404).json({
          message: "Client not found",
          data: {
            client_id: error.data.clientId,
          },
        })
      }

      if (error.code === "SOME_ATTACHMENTS_NOT_FOUND") {
        return response.status(404).json({
          message: "Some attachments were not found",
          data: {
            missing_attachment_ids: error.data.missingIds,
            total_requested: attachmentIds.length,
            found_count: attachmentIds.length - error.data.missingIds.length,
          },
        })
      }

      if (error.code === "ATTACHMENTS_HAS_EXPIRED") {
        return response.status(410).json({
          message: "All attachments have expired or are no longer accessible",
          data: {
            attachment_count: attachmentIds.length,
            suggestion: "Please re-upload the attachments",
          },
        })
      }

      if (error.code === "FAILED_TO_PROCESS_ATTACHMENTS") {
        return response.status(422).json({
          message: "Failed to process some attachments",
          data: {
            failed_attachments: error.data.details,
            retry_recommended: true,
          },
        })
      }

      if (error.code === "FAILED_TO_SEND_EMAIL") {
        return response.status(500).json({
          message: "Failed to send email",
          data: {
            retry_after: "5 minutes",
          },
        })
      }

      return response.status(400).json({
        message: "An unexpected error occurred",
        data: {},
      })
    }

    return response.status(200).json({
      message: "Email sent successfully",
      data: {
        email_id: result.mailId,
        recipient: result.data.recipientEmail,
        attachment_count: result.data.attachmentIds.length,
        sent_at: new Date().toISOString(),
      },
    })
  }
}
