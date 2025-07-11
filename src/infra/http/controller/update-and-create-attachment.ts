import { Request, Response } from "express"
import z from "zod"

import { UploadAndCreateAttachmentUseCase } from "@/domain/application/use-cases/upload-and-create-attachment"

const updateAndCreateAttachmentBody = z.object({
  fileName: z.string(),
  fileType: z.string(),
  body: z.instanceof(Buffer),
})

export class UpdateAndCreateAttachmentController {
  constructor(
    private updateAndCreateAttachmentUseCase: UploadAndCreateAttachmentUseCase,
  ) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { fileName, fileType, body } = updateAndCreateAttachmentBody.parse(
      request.body,
    )

    const [error, result] = await this.updateAndCreateAttachmentUseCase.execute(
      {
        fileName,
        fileType,
        body,
      },
    )

    if (error) {
      if (error.CODE === "INVALID_FILE_TYPE") {
        return response.status(400).json("Invalid file type")
      }

      return response.status(400).send("Client Error")
    }

    return response.status(201).json(result.attachment)
  }
}
