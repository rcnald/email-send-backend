import {
  Attachment as PrismaAttachment,
  Mail as PrismaMail,
  Prisma,
} from "@prisma/client"

import { Mail } from "@/domain/enterprise/entities/mail"
import { Email } from "@/domain/enterprise/entities/value-object/email"
import { UniqueId } from "@/core/entities/value-objects/unique-id"

export class PrismaMailMapper {
  static toPrisma(mail: Mail): Prisma.MailUncheckedCreateInput {
    return {
      id: mail.id.value,
      accountantEmail: mail.accountantEmail.value,
      html: mail.html,
      text: mail.text,
      subject: mail.subject,
      clientCNPJ: mail.clientCNPJ,
      clientId: mail.clientId.value,
      clientName: mail.clientName,
      referenceMonth: mail.referenceMonth,
      failedAt: mail.failedAt,
      sentAt: mail.sentAt,
      createdAt: mail.createdAt,
      updatedAt: mail.updatedAt,
    }
  }

  static toDomain(raw: PrismaMail, rawAttachments: PrismaAttachment[]): Mail {
    return Mail.create(
      {
        accountantEmail: Email.fromPersistence(raw.accountantEmail),
        html: raw.html,
        text: raw.text,
        subject: raw.subject,
        attachmentIds: rawAttachments.map(
          (attachment) => new UniqueId(attachment.id),
        ),
        clientCNPJ: raw.clientCNPJ,
        clientId: new UniqueId(raw.clientId),
        clientName: raw.clientName,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        referenceMonth: raw.referenceMonth,
      },
      new UniqueId(raw.id),
    )
  }
}
