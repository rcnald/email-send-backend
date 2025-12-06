import { DomainError } from "@/core/domain-error"
import { bad, nice } from "@/core/error"

import { AttachmentRepository } from "../../repositories/attachment-repository"
import { Deleter } from "../../storage/deleter"

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
      return bad(DomainError.NotFound("Attachment not found", { attachmentId }))
    }

    if (attachment.mailId) {
      return bad(
        DomainError.OperationFailed("Attachment is in use", {
          attachmentId,
          attachmentTitle: attachment.title,
        }),
      )
    }

    const [error] = await this.deleter.delete({ url: attachment.url })

    if (error) {
      return bad({ ...error, data: { attachmentId: attachment.id } })
    }

    await this.attachmentRepository.delete(attachment.id.value)

    return nice()
  }
}
