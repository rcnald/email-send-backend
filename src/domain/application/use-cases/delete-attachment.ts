import { bad, nice } from "@/core/error"

import { AttachmentRepository } from "../repositories/attachment-repository"
import { Deleter } from "../storage/deleter"

export interface DeleteAttachmentRequest {
  attachmentId: string
}

export class DeleteAttachmentUseCase {
  constructor(
    private attachmentRepository: AttachmentRepository,
    private deleter: Deleter,
  ) {}

  async execute({ attachmentId }: DeleteAttachmentRequest) {
    const attachment = await this.attachmentRepository.find(attachmentId)

    if (!attachment) {
      return bad({
        code: "ATTACHMENT_NOT_FOUND",
        message: "Attachment not found",
        data: { attachmentId },
      })
    }

    if (attachment.mailId) {
      return bad({
        code: "ATTACHMENT_IN_USE",
        message: "Attachment is in use",
        data: { attachmentId, attachmentTitle: attachment.title },
      })
    }

    const [error] = await this.deleter.delete({ attachmentId: attachment.id })

    if (error) {
      return bad({ ...error, data: { attachmentId: attachment.id } })
    }

    await this.attachmentRepository.delete(attachment.id)

    return nice()
  }
}
