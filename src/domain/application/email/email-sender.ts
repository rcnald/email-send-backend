export interface EmailAttachment {
  filename: string
  content: Buffer
  type: "application/zip"
}

export interface SendEmailParams {
  to: string | string[]
  from: string
  subject: string
  html: string
  text?: string
  attachments?: EmailAttachment[]
}

export abstract class EmailSender {
  abstract send(
    params: SendEmailParams,
  ): Promise<
    | [undefined, { ok: true }, undefined]
    | [
        { code: "EMAIL_TO_SENT_NOT_FOUND"; message: "Email not found" },
        undefined,
        undefined,
      ]
  >
}
