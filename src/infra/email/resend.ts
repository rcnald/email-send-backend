import { Resend } from "resend";

import { DomainError } from "@/core/domain-error";
import { bad, nice } from "@/core/error";
import type {
  EmailSender,
  SendEmailParams,
} from "@/domain/application/email/email-sender";
import { getEnv } from "@/infra/env";

const env = getEnv();
const resend = new Resend(env.RESEND_API_KEY);

export class RendEmailSender implements EmailSender {
  async send(
    params: SendEmailParams
  ): Promise<
    | [undefined, { ok: true }, undefined]
    | [
        ReturnType<typeof DomainError.ExternalServiceFailed>,
        undefined,
        undefined,
      ]
  > {
    if (env.ENVIRONMENT === "production") {
      const response = await resend.emails.send({
        from: "New Support <newsupport@rcnald.dev>",
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        attachments: params.attachments?.map((attachment) => ({
          content: attachment.content,
          filename: attachment.filename,
          contentType: attachment.type,
        })),
      });

      if (response.error) {
        return bad(
          DomainError.ExternalServiceFailed("Falha ao enviar e-mail", {
            details: [response.error.message],
          })
        );
      }
    }

    return nice({ ok: true });
  }
}
