import { Request, Response } from "express"
import z from "zod"
import { fromZodError } from "zod-validation-error/v4"

import { UploadAndCreateAttachmentUseCase } from "@/domain/application/use-cases/upload-and-create-attachment"

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
    const fileValidation = attachmentFileSchema.safeParse(request.file)

    if (!fileValidation.success) {
      const formattedError = fromZodError(fileValidation.error)

      return response.status(400).json({
        message: "Invalid file type or size",
        data: {
          field_errors: formattedError.details,
        },
      })
    }

    const {
      mimetype: fileType,
      buffer: body,
      originalname: fileName,
    } = fileValidation.data

    const [error, result] = await this.updateAndCreateAttachmentUseCase.execute(
      {
        fileName,
        fileType,
        body,
      },
    )

    if (error) {
      if (error.code === "INVALID_FILE_TYPE") {
        return response.status(400).json({
          message: "Invalid file type",
          data: {
            accepted_types: ACCEPTED_MIME_TYPES,
          },
        })
      }

      if (error.code === "FAILED_TO_UPLOAD") {
        return response.status(400).json({
          message: "Failed to upload file",
          data: {},
        })
      }

      return response
        .status(400)
        .send({ message: "An unexpected error occurred", data: {} })
    }

    return response.status(201).json({ attachment_id: result.attachment.id })
  }
}
