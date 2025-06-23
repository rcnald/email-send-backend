import { bad, nice } from "@/core/error"
import { Mail } from "@/domain/enterprise/entities/mail"
import { createEmailAttachmentsFromUrls } from "@/domain/enterprise/utils/create-email-attachment-from-url"

import { EmailSender } from "../email/email-sender"
import { AttachmentRepository } from "../repositories/attachment-repository"
import { ClientRepository } from "../repositories/client-repository"
import { MailRepository } from "../repositories/mail-repository"

export interface SentEmailUseCaseRequest {
  email: string
  clientId: string
  attachmentIds: string[]
}

export class SentEmailUseCase {
  constructor(
    private mailRepository: MailRepository,
    private clientRepository: ClientRepository,
    private attachmentRepository: AttachmentRepository,
    private emailSender: EmailSender,
  ) {}

  async execute({ email, clientId, attachmentIds }: SentEmailUseCaseRequest) {
    const client = await this.clientRepository.find(clientId)

    if (!client) return bad({ code: "CLIENT_NOT_FOUND" })

    const mail = Mail.create({
      clientId,
      attachmentIds,
      accountantEmail: email,
      clientCNPJ: client.CNPJ,
      clientName: client.name,
      referenceMonth: new Date().getMonth().toString(),
    })

    this.mailRepository.create(mail)

    const attachments = (
      await Promise.all(
        mail.attachmentIds.map((id) => this.attachmentRepository.find(id)),
      )
    ).filter((attachment) => !!attachment)

    const [createEmailAttachmentsError, emailAttachments] =
      await createEmailAttachmentsFromUrls(attachments)

    if (createEmailAttachmentsError) return bad(createEmailAttachmentsError)

    const [emailSenderError] = await this.emailSender.send({
      to: mail.accountantEmail,
      from: "email@email.com",
      html: mail.html,
      text: mail.text,
      subject: mail.subject,
      attachments: emailAttachments,
    })

    if (emailSenderError) {
      return bad(emailSenderError)
    }

    return nice({})
  }
}
