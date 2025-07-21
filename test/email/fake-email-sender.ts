import { nice } from "@/core/error"
import { EmailSender } from "@/domain/application/email/email-sender"

export class FakeEmailSender implements EmailSender {
  async send(): Promise<
    | [undefined, { ok: true }, undefined]
    | [
        { code: "EMAIL_TO_SENT_NOT_FOUND"; message: "Email not found" },
        undefined,
        undefined,
      ]
  > {
    return nice({ ok: true })
  }
}
