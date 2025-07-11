import { bad, nice } from "@/core/error"
import { Attachment } from "@/domain/enterprise/entities/attachment"

import { AttachmentRepository } from "../repositories/attachment-repository"
import { Uploader } from "../storage/uploader"

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
      return bad({ CODE: "INVALID_FILE_TYPE", message: "Invalid file type" })
    }

    const { url } = await this.uploader.upload({ fileName, fileType, body })

    const attachment = Attachment.create({ title: fileName, url })

    this.attachmentRepository.create(attachment)

    return nice({ attachment })
  }
}
