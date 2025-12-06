import { Request, Response } from "express"
import z from "zod"
import { fromZodError } from "zod-validation-error/v4"

import { DeleteAttachmentUseCase } from "@/domain/application/use-cases/attachment/delete-attachment"
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler"

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
      return HttpErrorHandler.handle(response, error)
    }

    return response.status(204).json({
      message: "Attachment deleted successfully",
    })
  }
}
