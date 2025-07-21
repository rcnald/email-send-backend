import { nice } from "@/core/error"
import { EmailSender } from "@/domain/application/email/email-sender"

export class FakeEmailSender implements EmailSender {
  async send(): Promise<
    | [undefined, { ok: true }, undefined]
    | [
        { code: "FAILED_TO_SEND_EMAIL"; message: "Failed to send email" },
        undefined,
        undefined,
      ]
  > {
    return nice({ ok: true })
  }
}
