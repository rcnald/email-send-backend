import { Entity } from "@/core/entities/entity"

export interface AttachmentProps {
  title: string
  url: string
  mailId?: string
}

export class Attachment extends Entity<AttachmentProps> {
  get title() {
    return this.props.title
  }

  set title(value: string) {
    this.props.title = value
  }

  get url() {
    return this.props.url
  }

  set url(value: string) {
    this.props.url = value
  }

  get mailId(): string | undefined {
    return this.props.mailId
  }

  set mailId(value: string | undefined) {
    this.props.mailId = value
  }

  static create({ title, url, mailId }: AttachmentProps, id?: string) {
    const attachment = new Attachment({ title, url, mailId }, id)

    return attachment
  }
}
