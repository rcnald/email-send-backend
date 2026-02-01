import { Entity } from "@/core/entities/entity";
import type { UniqueId } from "@/core/entities/value-objects/unique-id";

export interface AttachmentProps {
  title: string;
  url: string;
  mailId?: UniqueId;
}

export class Attachment extends Entity<AttachmentProps> {
  get title() {
    return this.props.title;
  }

  set title(value: string) {
    this.props.title = value;
  }

  get url() {
    return this.props.url;
  }

  set url(value: string) {
    this.props.url = value;
  }

  get mailId(): UniqueId | undefined {
    return this.props.mailId;
  }

  set mailId(value: UniqueId | undefined) {
    this.props.mailId = value;
  }

  static create({ title, url, mailId }: AttachmentProps, id?: UniqueId) {
    const attachment = new Attachment({ title, url, mailId }, id);

    return attachment;
  }
}
