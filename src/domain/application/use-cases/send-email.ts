import { bad, nice, warn } from "@/core/error"
import { createEmailAttachmentsFromUrls } from "@/domain/application/utils/create-email-attachment-from-url"
import { generateFileName } from "@/domain/application/utils/file-name-generator"
import { Attachment } from "@/domain/enterprise/entities/attachment"
import { Mail } from "@/domain/enterprise/entities/mail"

import { EmailSender } from "../email/email-sender"
import { AttachmentRepository } from "../repositories/attachment-repository"
import { ClientRepository } from "../repositories/client-repository"
import { MailRepository } from "../repositories/mail-repository"
import { Downloader } from "../storage/downloader"
import { Renamer } from "../storage/renamer"

export interface SendEmailUseCaseRequest {
  clientId: string
  attachmentIds: string[]
}

export class SendEmailUseCase {
  constructor(
    private mailRepository: MailRepository,
    private clientRepository: ClientRepository,
    private attachmentRepository: AttachmentRepository,
    private renamer: Renamer,
    private emailSender: EmailSender,
    private downloader: Downloader,
  ) {}

  async execute({ clientId, attachmentIds }: SendEmailUseCaseRequest) {
    const client = await this.clientRepository.find(clientId)

    if (!client)
      return bad({
        code: "CLIENT_NOT_FOUND",
        message: "Client not found",
        data: { clientId },
      })

    const mail = Mail.create({
      clientId,
      attachmentIds,
      accountantEmail: client.accountant.email,
      clientCNPJ: client.CNPJ,
      clientName: client.name,
    })

    this.mailRepository.create(mail)

    const [attachments, missingIds] =
      await this.attachmentRepository.findManyByMultipleIds(mail.attachmentIds)

    if (missingIds.length > 0) {
      return bad({
        code: "SOME_ATTACHMENTS_NOT_FOUND",
        message: "Some attachments were not found",
        data: { missingIds },
      })
    }

    const [attachmentsError, emailAttachments] = await this._fetchAttachments({
      attachments,
      mail,
    })

    if (attachmentsError) {
      mail.failed()

      await this.mailRepository.update(mail)

      return bad(attachmentsError)
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
      mail.failed()

      await this.mailRepository.update(mail)

      return bad(emailSenderError)
    }

    mail.sent()

    await this.mailRepository.update(mail)

    return nice({
      mailId: mail.id,
      data: {
        recipientEmail: mail.accountantEmail,
        attachmentIds: mail.attachmentIds,
      },
    })
  }

  private async _fetchAttachments({
    attachments,
    mail,
  }: {
    attachments: Attachment[]
    mail: Mail
  }) {
    const [renameAttachmentsError, renamedAttachments] =
      await this._renameAttachments({
        mail,
        attachments,
      })

    if (renameAttachmentsError) {
      return bad(renameAttachmentsError)
    }

    const [createEmailAttachmentsError, emailAttachments] =
      await createEmailAttachmentsFromUrls(renamedAttachments, {
        downloader: this.downloader,
      })

    if (createEmailAttachmentsError) {
      return bad(createEmailAttachmentsError)
    }

    return nice(emailAttachments)
  }

  private async _renameAttachments({
    mail,
    attachments,
  }: {
    mail: Mail
    attachments: Attachment[]
  }) {
    const attachmentPromises = attachments.map(async (attachment, index) => {
      const { name: newName, url: newUrl } = generateFileName(
        mail.clientName,
        mail.referenceMonth,
        index,
      )

      await this.renamer.rename({
        currentFileUrl: attachment.url,
        newFileUrl: newUrl,
      })

      attachment.title = newName
      attachment.url = newUrl

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
      return bad({
        code: "FAILED_TO_PROCESS_ATTACHMENTS",
        message: "attachments failed to be processed.",
        data: {
          details: failedReasons.map((reason) => reason.message),
        },
      })
    }

    return nice(successfulAttachments)
  }
}
