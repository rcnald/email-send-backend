import { randomUUID } from "node:crypto"

import { Optional } from "@/core/types/optional"

import { generateMailContent } from "../utils/mail-generator"

export interface MailProps {
  accountantEmail: string
  attachmentIds: string[]
  clientId: string
  clientCNPJ: string
  clientName: string
  referenceMonth: string
  subject: string
  html: string
  text: string
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

  get html() {
    return this.props.html
  }

  get text() {
    return this.props.text
  }

  get subject() {
    return this.props.subject
  }

  get attachmentIds() {
    return this.props.attachmentIds
  }

  get clientCNPJ() {
    return this.props.clientCNPJ
  }

  get clientId() {
    return this.props.clientId
  }

  static create(
    {
      clientCNPJ,
      clientId,
      clientName,
      accountantEmail,
      attachmentIds,
      referenceMonth,
      html,
      text,
      subject,
    }: Optional<MailProps, "status" | "message" | "text" | "html" | "subject">,
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
        clientId,
        accountantEmail,
        attachmentIds,
        clientName,
        referenceMonth,
        html: html ?? mailContent.html,
        text: text ?? mailContent.text,
        subject: subject ?? mailContent.subject,
        status: "pending",
      },
      id,
    )

    return mail
  }
}
