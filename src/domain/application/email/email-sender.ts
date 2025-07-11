export interface EmailAttachment {
  filename: string
  content: Buffer
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
    | [undefined, { ok: true }]
    | [{ code: "EMAIL_TO_SENT_NOT_FOUND" } | undefined]
  >
}
