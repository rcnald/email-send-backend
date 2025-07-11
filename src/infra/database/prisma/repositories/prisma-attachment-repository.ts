import { PrismaClient } from "@prisma/client"

import { AttachmentRepository } from "@/domain/application/repositories/attachment-repository"
import { Attachment } from "@/domain/enterprise/entities/attachment"
import { PrismaAttachmentMapper } from "../mappers/prisma-attachment-mapper"

export class PrismaAttachmentRepository implements AttachmentRepository {
  constructor(private prisma: PrismaClient) { }

  async create(attachment: Attachment): Promise<void> {
    const data = PrismaAttachmentMapper.toPrisma(attachment)

    await this.prisma.attachment.create({
      data
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.attachment.delete({
      where: { id },
    })
  }

  async find(id: string): Promise<Attachment | null> {
    const attachment =  await this.prisma.attachment.findUnique({
      where: { id },
    })

    if (!attachment) {
      return null
    }

    return PrismaAttachmentMapper.toDomain(attachment)
  }

  async findManyByMultipleIds(ids: string[]): Promise<Attachment[]> {
    const attachments = await this.prisma.attachment.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    return attachments.map(PrismaAttachmentMapper.toDomain)
  }

  async update(attachment: Attachment): Promise<void> {
    const data = PrismaAttachmentMapper.toPrisma(attachment)

    await this.prisma.attachment.update({
      where: { id: attachment.id },
      data,
    })
  }
}
