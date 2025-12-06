import { Request, Response } from "express"
import z from "zod"

import { UploadAndCreateAttachmentUseCase } from "@/domain/application/use-cases/attachment/upload-and-create-attachment"
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler"
import { validateRequest } from "@/infra/http/handlers/http-validation"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_MIME_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
  "application/x-zip",
]

const attachmentFileSchema = z.object({
  originalname: z.string(),
  mimetype: z.string().refine((mime) => ACCEPTED_MIME_TYPES.includes(mime), {
    message: `File type invalid. Accepted types: ${ACCEPTED_MIME_TYPES.join(", ")}.`,
  }),
  size: z.number().max(MAX_FILE_SIZE, {
    message: `File too large. Maximum size ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
  }),
  buffer: z.instanceof(Buffer),
})

export class UpdateAndCreateAttachmentController {
  constructor(
    private updateAndCreateAttachmentUseCase: UploadAndCreateAttachmentUseCase,
  ) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const file = validateRequest(response, attachmentFileSchema, request.file, {
      message: "Invalid file type or size",
    })

    if (!file) return response

    const { mimetype: fileType, buffer: body, originalname: fileName } = file

    const [error, result] = await this.updateAndCreateAttachmentUseCase.execute(
      {
        fileName,
        fileType,
        body,
      },
    )

    if (error) {
      return HttpErrorHandler.handle(response, error)
    }

    return response.status(201).json({ attachment_id: result.attachmentId })
  }
}
