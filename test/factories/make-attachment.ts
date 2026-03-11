import { faker } from "@faker-js/faker";
import type { PrismaClient } from "@prisma/client";

import type { UniqueId } from "@/core/entities/value-objects/unique-id";
import type { Uploader } from "@/domain/application/storage/uploader";
import {
  Attachment,
  type AttachmentProps,
} from "@/domain/enterprise/entities/attachment";
import { PrismaAttachmentMapper } from "@/infra/database/prisma/mappers/prisma-attachment-mapper";

export const makeAttachment = (
  { mailId, title, url }: Partial<AttachmentProps> = {},
  id?: UniqueId
) => {
  const attachment = Attachment.create(
    {
      title: title ?? faker.system.commonFileName("zip"),
      url: url ?? faker.internet.url(),
      mailId,
    },
    id
  );

  return attachment;
};

export class AttachmentFactory {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly uploader: Uploader
  ) {}

  async makePrismaAttachment(
    props: Partial<AttachmentProps> = {},
    id?: UniqueId
  ): Promise<Attachment> {
    const attachment = makeAttachment(props, id);

    const [error, result] = await this.uploader.upload({
      fileName: attachment.title,
      fileType: "application/zip",
      body: Buffer.from(attachment.title),
    });

    if (error) {
      throw new Error(`Falha ao enviar anexo: ${error.message}`);
    }

    attachment.url = result.url;

    await this.prisma.attachment.create({
      data: PrismaAttachmentMapper.toPrisma(attachment),
    });

    return attachment;
  }
}
