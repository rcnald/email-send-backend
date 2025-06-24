import { randomUUID } from "crypto"

export interface AttachmentProps {
  title: string
  url: string
}

export class Attachment {
  private _id: string

  constructor(
    private props: AttachmentProps,
    id?: string,
  ) {
    this._id = id ?? randomUUID()
  }

  get id() {
    return this._id
  }

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

  static create({ title, url }: AttachmentProps, id?: string) {
    const attachment = new Attachment({ title, url }, id)

    return attachment
  }
}
