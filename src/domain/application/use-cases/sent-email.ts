import { bad, nice } from "@/core/error"
import { Attachment } from "@/domain/enterprise/entities/attachment"
import { Mail } from "@/domain/enterprise/entities/mail"
import { createEmailAttachmentsFromUrls } from "@/domain/enterprise/utils/create-email-attachment-from-url"
import { generateFileName } from "@/domain/enterprise/utils/file-name-generator"

import { EmailSender } from "../email/email-sender"
import { AttachmentRepository } from "../repositories/attachment-repository"
import { ClientRepository } from "../repositories/client-repository"
import { MailRepository } from "../repositories/mail-repository"
import { Renamer } from "../storage/renamer"

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
    private renamer: Renamer,
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
    })

    this.mailRepository.create(mail)

    const attachments = await this.attachmentRepository.findManyByMultipleIds(
      mail.attachmentIds,
    )

    const [processAndRenameError, emailAttachments] =
      await this._processAndRenameAttachments({
        attachments,
        mail,
        clientName: client.name,
      })

    if (processAndRenameError) {
      return bad(processAndRenameError)
    }

    const [emailSenderError] = await this.emailSender.send({
      to: mail.accountantEmail,
      from: "email@email.com",
      html: mail.html,
      text: mail.text,
      subject: mail.subject,
      attachments: emailAttachments,
    })

    if (emailSenderError) {
      mail.status = "failed_to_send"

      await this.mailRepository.update(mail)

      return bad(emailSenderError)
    }

    mail.status = "sent"

    await this.mailRepository.update(mail)

    return nice({})
  }

  private async _processAndRenameAttachments({
    attachments,
    mail,
    clientName,
  }: {
    attachments: Attachment[]
    mail: Mail
    clientName: string
  }) {
    const attachmentPromises = attachments.map(async (attachment, index) => {
      const newFileName = generateFileName(
        clientName,
        mail.referenceMonth,
        index,
      )

      const { url } = await this.renamer.rename({
        currentFileName: attachment.title,
        newFileName,
      })

      attachment.title = newFileName
      attachment.url = url

      await this.attachmentRepository.update(attachment)

      return attachment
    })

    const settledResults = await Promise.allSettled(attachmentPromises)

    const successfulAttachments = []
    const failedReasons = []

    for (const result of settledResults) {
      if (result.status === "fulfilled") {
        successfulAttachments.push(result.value)
      } else {
        failedReasons.push(result.reason)
      }
    }

    if (failedReasons.length > 0) {
      mail.status = "failed_to_send"

      await this.mailRepository.update(mail)

      return bad({
        code: "ATTACHMENT_PROCESSING_ERROR",
        message: "One or more attachments failed to be processed.",
        details: failedReasons.map((r) => r.message), // Envia detalhes do erro
      })
    }

    attachments = successfulAttachments

    const [createEmailAttachmentsError, emailAttachments] =
      await createEmailAttachmentsFromUrls(attachments)

    if (createEmailAttachmentsError) {
      mail.status = "failed_to_send"

      await this.mailRepository.update(mail)

      return bad(createEmailAttachmentsError)
    }

    return nice(emailAttachments)
  }
}
