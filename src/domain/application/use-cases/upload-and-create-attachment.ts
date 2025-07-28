import { bad, nice } from "@/core/error"
import { Attachment } from "@/domain/enterprise/entities/attachment"

import { AttachmentRepository } from "../repositories/attachment-repository"
import { Uploader } from "../storage/uploader"

// TODO: Create an use case for creating an pre signed URL for uploading files
export interface UploadAndCreateAttachmentUseCaseRequest {
  fileName: string
  fileType: string
  body: Buffer
}

export class UploadAndCreateAttachmentUseCase {
  constructor(
    private attachmentRepository: AttachmentRepository,
    private uploader: Uploader,
  ) {}

  async execute({
    fileName,
    fileType,
    body,
  }: UploadAndCreateAttachmentUseCaseRequest) {
    const zipRegex = /zip$/i

    const isFileTypeValid = zipRegex.test(fileType)

    if (!isFileTypeValid) {
      return bad({
        code: "INVALID_FILE_TYPE",
        message: "Invalid file type",
        data: { invalidFileType: fileType },
      })
    }

    const [error, result] = await this.uploader.upload({
      fileName,
      fileType,
      body,
    })

    if (error) {
      return bad(error)
    }

    const { url } = result

    const attachment = Attachment.create({ title: fileName, url })

    this.attachmentRepository.create(attachment)

    return nice({ attachment })
  }
}
