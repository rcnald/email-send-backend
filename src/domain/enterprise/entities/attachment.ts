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

  get url() {
    return this.props.url
  }

  static create({ title, url }: AttachmentProps, id?: string) {
    const attachment = new Attachment({ title, url }, id)

    return attachment
  }
}
