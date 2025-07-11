import { Attachment as PrismaAttachment, Prisma } from "@prisma/client"

import { Attachment } from "@/domain/enterprise/entities/attachment"

export class PrismaAttachmentMapper {
  static toDomain(raw: PrismaAttachment): Attachment {
    return Attachment.create(
      { title: raw.title, url: raw.url, mailId: raw.mailId ?? undefined },
      raw.id,
    )
  }

  static toPrisma(
    attachment: Attachment,
  ): Prisma.AttachmentUncheckedCreateInput {
    return {
      id: attachment.id,
      title: attachment.title,
      url: attachment.url,
      mailId: attachment.mailId,
    }
  }
}
