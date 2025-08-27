import { faker } from "@faker-js/faker"
import { PrismaClient } from "@prisma/client"

import { Client } from "@/domain/enterprise/entities/client"
import { Mail, MailProps } from "@/domain/enterprise/entities/mail"
import { PrismaMailMapper } from "@/infra/database/prisma/mappers/prisma-mail-mapper"

export const makeMail = (
  {
    subject,
    accountantEmail,
    attachmentIds,
    clientCNPJ,
    clientName,
    failedAt,
    html,
    message,
    referenceMonth,
    text,
    clientId,
    sentAt,
    createdAt,
    updatedAt,
  }: Partial<MailProps> = {},
  id?: string,
) => {
  const mail = Mail.create(
    {
      subject: subject ?? faker.lorem.sentence(),
      accountantEmail: accountantEmail ?? faker.internet.email(),
      attachmentIds: attachmentIds ?? [],
      clientCNPJ: clientCNPJ ?? faker.string.numeric(14),
      clientName: clientName ?? faker.company.name(),
      failedAt: failedAt ?? undefined,
      html: html ?? faker.lorem.paragraph(),
      message: message ?? faker.lorem.sentence(),
      referenceMonth: referenceMonth ?? undefined,
      text: text ?? faker.lorem.paragraph(),
      clientId: clientId ?? faker.string.uuid(),
      createdAt: createdAt ?? new Date(),
      updatedAt: updatedAt ?? undefined,
      sentAt: sentAt ?? undefined,
    },
    id,
  )

  return mail
}

export class MailFactory {
  constructor(private prisma: PrismaClient) {}

  async makePrismaMail(
    props: Partial<MailProps> = {},
    id?: string,
  ): Promise<Mail> {
    const mail = makeMail(props, id)

    await this.prisma.mail.create({
      data: PrismaMailMapper.toPrisma(mail),
    })

    return mail
  }
}
