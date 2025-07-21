import { faker } from "@faker-js/faker"

import {
  Attachment,
  AttachmentProps,
} from "@/domain/enterprise/entities/attachment"

export const makeAttachment = (
  { mailId, title, url }: Partial<AttachmentProps> = {},
  id?: string,
) => {
  const attachment = Attachment.create(
    {
      title: title ?? faker.system.commonFileName("zip"),
      url: url ?? faker.internet.url(),
      mailId,
    },
    id,
  )

  return attachment
}
