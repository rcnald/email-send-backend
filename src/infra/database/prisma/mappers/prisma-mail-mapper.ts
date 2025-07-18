import {
  Attachment as PrismaAttachment,
  Mail as PrismaMail,
  Prisma,
} from "@prisma/client"

import { Mail } from "@/domain/enterprise/entities/mail"

export class PrismaMailMapper {
  static toPrisma(mail: Mail): Prisma.MailUncheckedCreateInput {
    return {
      id: mail.id,
      accountantEmail: mail.accountantEmail,
      html: mail.html,
      text: mail.text,
      subject: mail.subject,
      clientCNPJ: mail.clientCNPJ,
      clientId: mail.clientId,
      clientName: mail.clientName,
      referenceMonth: mail.referenceMonth,
    }
  }

  static toDomain(raw: PrismaMail, rawAttachments: PrismaAttachment[]): Mail {
    return new Mail(
      {
        accountantEmail: raw.accountantEmail,
        html: raw.html,
        text: raw.text,
        subject: raw.subject,
        attachmentIds: rawAttachments.map((attachment) => attachment.id),
        clientCNPJ: raw.clientCNPJ,
        clientId: raw.clientId,
        clientName: raw.clientName,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        referenceMonth: raw.referenceMonth,
      },
      raw.id,
    )
  }
}
