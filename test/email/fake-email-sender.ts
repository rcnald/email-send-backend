import { DomainErrorData } from "@/core/domain-error"
import { nice } from "@/core/error"
import { EmailSender } from "@/domain/application/email/email-sender"

export class FakeEmailSender implements EmailSender {
  async send(): Promise<
    | [undefined, { ok: true }, undefined]
    | [DomainErrorData, undefined, undefined]
  > {
    return nice({ ok: true })
  }
}
