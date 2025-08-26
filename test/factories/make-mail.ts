import { faker } from "@faker-js/faker"

import { Mail, MailProps } from "@/domain/enterprise/entities/mail"

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
