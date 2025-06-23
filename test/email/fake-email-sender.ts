import { nice } from "@/core/error"
import {
  EmailSender,
  SendEmailParams,
} from "@/domain/application/email/email-sender"

export class FakeEmailSender implements EmailSender {
  async send(
    params: SendEmailParams,
  ): Promise<
    | [undefined, { ok: true }]
    | [{ code: "EMAIL_TO_SENT_NOT_FOUND" } | undefined]
  > {
    return nice({ ok: true })
  }
}
