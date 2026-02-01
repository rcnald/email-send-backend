import type { DomainErrorData } from "@/core/domain-error";
import { nice } from "@/core/error";
import type { EmailSender } from "@/domain/application/email/email-sender";

export class FakeEmailSender implements EmailSender {
  async send(): Promise<
    | [undefined, { ok: true }, undefined]
    | [DomainErrorData, undefined, undefined]
  > {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return nice({ ok: true });
  }
}
