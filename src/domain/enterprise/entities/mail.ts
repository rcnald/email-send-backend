import { randomUUID } from "node:crypto"

import { Optional } from "@/core/types/optional"

import { generateMailContent } from "../utils/mail-generator"

export interface MailProps {
  accountantEmail: string
  attachments: string[]
  clientCNPJ: string
  clientName: string
  referenceMonth: string
  subject: string
  body: string
  status: "failed_to_send" | "pending" | "draft" | "sent"
  message?: string
}

export class Mail {
  private _id: string

  constructor(
    private props: MailProps,
    id?: string,
  ) {
    this._id = id ?? randomUUID()
  }

  get id() {
    return this._id
  }

  get accountantEmail() {
    return this.props.accountantEmail
  }

  get body() {
    return this.props.body
  }

  get subject() {
    return this.props.subject
  }

  get attachments() {
    return this.props.attachments
  }

  get clientCNPJ() {
    return this.props.clientCNPJ
  }

  static create(
    {
      clientCNPJ,
      clientName,
      accountantEmail,
      attachments,
      referenceMonth,
      body,
      subject,
    }: Optional<MailProps, "status" | "message" | "body" | "subject">,
    id?: string,
  ) {
    const mailContent = generateMailContent({
      clientCNPJ,
      clientName,
      referenceMonth,
    })

    const mail = new Mail(
      {
        clientCNPJ,
        accountantEmail,
        attachments,
        clientName,
        referenceMonth,
        body: body ?? mailContent.body,
        subject: subject ?? mailContent.subject,
        status: "pending",
      },
      id,
    )

    return mail
  }
}
