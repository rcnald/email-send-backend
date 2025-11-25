import { Attachment as PrismaAttachment, Prisma } from "@prisma/client"

import { Attachment } from "@/domain/enterprise/entities/attachment"
import { Email } from "@/domain/enterprise/entities/value-object/email"
import { UniqueId } from "@/core/entities/value-objects/unique-id"

export class PrismaAttachmentMapper {
  static toDomain(raw: PrismaAttachment): Attachment {
    return Attachment.create(
      {
        title: raw.title,
        url: raw.url,
        mailId: raw.mailId ? Email.fromPersistence(raw.mailId) : undefined,
      },
      new UniqueId(raw.id),
    )
  }

  static toPrisma(
    attachment: Attachment,
  ): Prisma.AttachmentUncheckedCreateInput {
    return {
      id: attachment.id.value,
      title: attachment.title,
      url: attachment.url,
      mailId: attachment.mailId?.value,
    }
  }
}
