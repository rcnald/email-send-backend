import { PrismaClient } from "@prisma/client"

import { MailRepository } from "@/domain/application/repositories/mail-repository"
import { Mail } from "@/domain/enterprise/entities/mail"

import { PrismaMailMapper } from "../mappers/prisma-mail-mapper"

export class PrismaMailRepository implements MailRepository {
  constructor(private prisma: PrismaClient) {}

  async create(mail: Mail): Promise<void> {
    await this.prisma.mail.create({
      data: PrismaMailMapper.toPrisma(mail),
    })
  }

  async update(mail: Mail): Promise<void> {
    await this.prisma.mail.update({
      where: { id: mail.id },
      data: PrismaMailMapper.toPrisma(mail),
    })
  }
}
