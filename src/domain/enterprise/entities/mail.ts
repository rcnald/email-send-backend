import { randomUUID } from "node:crypto"

import { Optional } from "@/core/types/optional"

import { generateMailContent } from "../../application/utils/mail-generator"

export interface MailProps {
  accountantEmail: string
  attachmentIds: string[]
  clientId: string
  clientCNPJ: string
  clientName: string
  referenceMonth: number
  subject: string
  html: string
  text: string
  failedAt?: Date | null
  sentAt?: Date | null
  createdAt: Date
  updatedAt: Date
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

  get clientName() {
    return this.props.clientName
  }

  get status() {
    if (this.props.failedAt) {
      return "failed"
    }

    if (this.props.sentAt) {
      return "sent"
    }

    return "draft"
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get referenceMonth() {
    return this.props.referenceMonth
  }

  get failedAt(): Date | null | undefined {
    return this.props.failedAt
  }

  set failedAt(date: Date | null) {
    this.props.failedAt = date
    this.touch()
  }

  get sentAt(): Date | null | undefined {
    return this.props.sentAt
  }

  set sentAt(date: Date | null) {
    this.props.sentAt = date
    this.touch()
  }

  failed() {
    this.props.failedAt = new Date()
    this.touch()
  }

  sent() {
    this.props.sentAt = new Date()
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
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
      createdAt,
      updatedAt,
    }: Optional<
      MailProps,
      | "message"
      | "text"
      | "html"
      | "subject"
      | "referenceMonth"
      | "createdAt"
      | "updatedAt"
    >,
    id?: string,
  ) {
    const previousCurrentMonth = new Date().getMonth() - 1

    const monthBRL = new Intl.DateTimeFormat("pt-BR", {
      month: "long",
    }).format(new Date().setMonth(referenceMonth ?? previousCurrentMonth))

    const mailContent = generateMailContent({
      clientCNPJ,
      clientName,
      referenceMonth: monthBRL,
    })

    const mail = new Mail(
      {
        clientCNPJ,
        clientId,
        accountantEmail,
        attachmentIds,
        clientName,
        referenceMonth: referenceMonth ?? previousCurrentMonth,
        html: html ?? mailContent.html,
        text: text ?? mailContent.text,
        subject: subject ?? mailContent.subject,
        createdAt: createdAt ?? new Date(),
        updatedAt: updatedAt ?? new Date(),
      },
      id,
    )

    return mail
  }
}
