import { AttachmentRepository } from "@/domain/application/repositories/attachment-repository"
import { Attachment } from "@/domain/enterprise/entities/attachment"

export class InMemoryAttachmentRepository implements AttachmentRepository {
  private attachments: Attachment[] = []

  async create(attachment: Attachment): Promise<void> {
    this.attachments.push(attachment)
  }

  async find(id: string): Promise<Attachment | null> {
    const attachment = this.attachments.find(
      (attachment) => attachment.id === id,
    )

    return attachment || null
  }
}
