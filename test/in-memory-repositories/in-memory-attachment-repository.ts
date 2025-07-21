import { AttachmentRepository } from "@/domain/application/repositories/attachment-repository"
import { Attachment } from "@/domain/enterprise/entities/attachment"

export class InMemoryAttachmentRepository implements AttachmentRepository {
  public attachments: Attachment[] = []

  async create(attachment: Attachment): Promise<void> {
    this.attachments.push(attachment)
  }

  async find(id: string): Promise<Attachment | null> {
    const attachment = this.attachments.find(
      (attachment) => attachment.id === id,
    )

    return attachment || null
  }

  async findManyByMultipleIds(
    ids: string[],
  ): Promise<[Attachment[], missingIds: string[]]> {
    const foundAttachments = this.attachments.filter((attachment) =>
      ids.includes(attachment.id),
    )
    const foundIds = foundAttachments.map((attachment) => attachment.id)
    const missingIds = ids.filter((id) => !foundIds.includes(id))

    return [foundAttachments, missingIds]
  }

  async update(attachment: Attachment): Promise<void> {
    const index = this.attachments.findIndex(
      (existingAttachment) => existingAttachment.id === attachment.id,
    )

    if (index !== -1) {
      this.attachments[index] = attachment
    }
  }
}
