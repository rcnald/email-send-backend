import { DomainError } from "@/core/domain-error";
import { UniqueId } from "@/core/entities/value-objects/unique-id";
import { bad, nice } from "@/core/error";
import { createEmailAttachmentsFromUrls } from "@/domain/application/utils/create-email-attachment-from-url";
import { generateFileName } from "@/domain/application/utils/file-name-generator";
import type { Attachment } from "@/domain/enterprise/entities/attachment";
import { Mail } from "@/domain/enterprise/entities/mail";

import type { EmailSender } from "../../email/email-sender";
import type { AttachmentRepository } from "../../repositories/attachment-repository";
import type { ClientRepository } from "../../repositories/client-repository";
import type { HelperRepository } from "../../repositories/helper-repository";
import type { MailRepository } from "../../repositories/mail-repository";
import type { Downloader } from "../../storage/downloader";
import type { Renamer } from "../../storage/renamer";

export interface SendEmailUseCaseRequest {
  clientId: string;
  helperId: string;
  attachmentIds: string[];
}

export class SendEmailUseCase {
  constructor(
    private readonly mailRepository: MailRepository,
    private readonly clientRepository: ClientRepository,
    private readonly attachmentRepository: AttachmentRepository,
    private readonly helperRepository: HelperRepository,
    private readonly renamer: Renamer,
    private readonly emailSender: EmailSender,
    private readonly downloader: Downloader
  ) {}

  async execute({
    clientId,
    helperId,
    attachmentIds,
  }: SendEmailUseCaseRequest) {
    const client = await this.clientRepository.find(clientId);

    if (!client) {
      return bad(DomainError.NotFound("Cliente nao encontrado", { clientId }));
    }

    const helper = await this.helperRepository.findById(helperId);

    if (!helper) {
      return bad(
        DomainError.NotFound("Assistente nao encontrado", { helperId })
      );
    }

    if (!helper.id.equals(client.helperId)) {
      return bad(
        DomainError.Forbidden("O assistente nao esta associado ao cliente", {
          helperId,
          clientId,
        })
      );
    }

    const mail = Mail.create({
      clientId: new UniqueId(clientId),
      helperId: new UniqueId(helperId),
      attachmentIds: attachmentIds.map((id) => new UniqueId(id)),
      accountantEmail: client.accountant.email,
      clientCNPJ: client.CNPJ,
      clientName: client.name,
    });

    await this.mailRepository.create(mail);

    const [attachments, missingIds] =
      await this.attachmentRepository.findManyByMultipleIds(
        mail.attachmentIds.map((id) => id.value)
      );

    if (missingIds.length > 0) {
      return bad(
        DomainError.NotFound("Alguns anexos nao foram encontrados", {
          missingIds,
        })
      );
    }

    attachments.forEach((attachment) => {
      attachment.mailId = mail.id;
      this.attachmentRepository.update(attachment);
    });

    const [attachmentsError, emailAttachments] = await this._fetchAttachments({
      attachments,
      mail,
    });

    if (attachmentsError) {
      mail.failed();

      await this.mailRepository.update(mail);

      return bad(attachmentsError);
    }

    const [emailSenderError] = await this.emailSender.send({
      to: mail.accountantEmail.value,
      from: "email@email.com",
      html: mail.html,
      text: mail.text,
      subject: mail.subject,
      attachments: emailAttachments,
    });

    if (emailSenderError) {
      mail.failed();

      await this.mailRepository.update(mail);

      return bad(emailSenderError);
    }

    mail.sent();

    await this.mailRepository.update(mail);

    return nice({
      mailId: mail.id,
    });
  }

  private async _fetchAttachments({
    attachments,
    mail,
  }: {
    attachments: Attachment[];
    mail: Mail;
  }) {
    const [renameAttachmentsError, renamedAttachments] =
      await this._renameAttachments({
        mail,
        attachments,
      });

    if (renameAttachmentsError) {
      return bad(renameAttachmentsError);
    }

    const [createEmailAttachmentsError, emailAttachments] =
      await createEmailAttachmentsFromUrls(renamedAttachments, {
        downloader: this.downloader,
      });

    if (createEmailAttachmentsError) {
      return bad(createEmailAttachmentsError);
    }

    return nice(emailAttachments);
  }

  private async _renameAttachments({
    mail,
    attachments,
  }: {
    mail: Mail;
    attachments: Attachment[];
  }) {
    const attachmentPromises = attachments.map(async (attachment, index) => {
      const { name: newName, url: newUrl } = generateFileName(
        mail.clientName,
        mail.referenceMonth,
        index
      );

      await this.renamer.rename({
        currentFileUrl: attachment.url,
        newFileUrl: newUrl,
      });

      attachment.title = newName;
      attachment.url = newUrl;

      await this.attachmentRepository.update(attachment);

      return attachment;
    });

    const settledResults = await Promise.allSettled(attachmentPromises);

    const successfulAttachments: Attachment[] = [];
    const failedReasons: { message: string }[] = [];

    for (const result of settledResults) {
      if (result.status === "fulfilled") {
        successfulAttachments.push(result.value);
      } else {
        failedReasons.push(result.reason);
      }
    }

    if (failedReasons.length > 0) {
      return bad(
        DomainError.ExternalServiceFailed("Falha ao processar anexos.", {
          details: failedReasons.map((reason) => reason.message),
        })
      );
    }

    return nice(successfulAttachments);
  }
}
