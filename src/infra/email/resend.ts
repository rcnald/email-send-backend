import { Resend } from "resend"

import { bad, nice } from "@/core/error"
import {
  EmailSender,
  SendEmailParams,
} from "@/domain/application/email/email-sender"
import { getEnv } from "@/infra/env"

const env = getEnv()
const resend = new Resend(env.RESEND_API_KEY)

export class RendEmailSender implements EmailSender {
  async send(
    params: SendEmailParams,
  ): Promise<
    | [undefined, { ok: true }]
    | [
        { code: "EMAIL_TO_SENT_NOT_FOUND"; message: "Email not found" },
        undefined,
      ]
  > {
    if (env.ENVIRONMENT === "production") {
      const response = await resend.emails.send({
        from: "Seu App de Testes <onboarding@resend.dev>",
        to: ["ronaldomjunior05@gmail.com"],
        subject: params.subject,
        html: params.html,
        text: params.text,
        attachments: params.attachments?.map((attachment) => ({
          content: attachment.content,
          filename: attachment.filename,
          contentType: attachment.type,
        })),
      })

      if (response.error) {
        return bad({
          code: "EMAIL_TO_SENT_NOT_FOUND",
          message: "Email not found",
        })
      }
    }

    return nice({ ok: true })
  }
}
