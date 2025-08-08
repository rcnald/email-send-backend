import { faker } from "@faker-js/faker"
import { PrismaClient } from "@prisma/client"

import { Uploader } from "@/domain/application/storage/uploader"
import {
  Attachment,
  AttachmentProps,
} from "@/domain/enterprise/entities/attachment"
import { PrismaAttachmentMapper } from "@/infra/database/prisma/mappers/prisma-attachment-mapper"

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

export class AttachmentFactory {
  constructor(
    private prisma: PrismaClient,
    private uploader: Uploader,
  ) {}

  async makePrismaAttachment(
    props: Partial<AttachmentProps> = {},
    id?: string,
  ): Promise<Attachment> {
    const attachment = makeAttachment(props, id)

    const [error, result] = await this.uploader.upload({
      fileName: attachment.title,
      fileType: "application/zip",
      body: Buffer.from(attachment.title),
    })

    if (error) {
      throw new Error(`Failed to upload attachment: ${error.message}`)
    }

    attachment.url = result.url

    await this.prisma.attachment.create({
      data: PrismaAttachmentMapper.toPrisma(attachment),
    })

    return attachment
  }
}
