import { Request, Response } from "express"
import z from "zod"
import { fromZodError } from "zod-validation-error/v4"

import { DeleteAttachmentUseCase } from "@/domain/application/use-cases/delete-attachment"

const deleteAttachmentControllerRouteParamsSchema = z.object({
  id: z.uuid(),
})

export class DeleteAttachmentController {
  constructor(private deleteAttachmentUseCase: DeleteAttachmentUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const routeParamsValidation =
      deleteAttachmentControllerRouteParamsSchema.safeParse(request.params)

    if (!routeParamsValidation.success) {
      const formattedError = fromZodError(routeParamsValidation.error)

      return response.status(400).json({
        message: "Invalid request body",
        data: {
          field_errors: formattedError.details,
        },
      })
    }

    const { id } = routeParamsValidation.data

    const [error] = await this.deleteAttachmentUseCase.execute({
      attachmentId: id,
    })

    if (error) {
      if (error.code === "ATTACHMENT_NOT_FOUND") {
        return response.status(404).json({
          message: "Attachment not found",
          data: {
            attachment_id: error.data.attachmentId,
          },
        })
      }

      if (error.code === "ATTACHMENT_IN_USE") {
        return response.status(409).json({
          message: "Attachment is in use and cannot be deleted",
          data: {
            attachment_id: error.data.attachmentId,
          },
        })
      }

      if (error.code === "ATTACHMENT_NOT_FOUND_ON_SERVER") {
        return response.status(404).json({
          message: "Attachment is not found on server",
          data: {
            attachment_id: error.data.attachmentId,
          },
        })
      }

      if (error.code === "FAILED_TO_DELETE") {
        return response.status(503).json({
          message: "Failed to delete attachment",
          data: {
            attachment_id: error.data.attachmentId,
          },
        })
      }

      return response.status(400).json({
        message: "An unexpected error occurred",
        data: {},
      })
    }

    return response.status(204).json({
      message: "Attachment deleted successfully",
    })
  }
}
