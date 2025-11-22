import { PrismaClient } from "@prisma/client"

import { HelperRepository } from "@/domain/application/repositories/helper-repository"
import { Helper } from "@/domain/enterprise/entities/helper"
import { PrismaHelperMapper } from "../mappers/prisma-helper-mapper"

export class PrismaHelperRepository implements HelperRepository {
  constructor(private prisma: PrismaClient) {}

  async create(helper: Helper): Promise<void> {
    await this.prisma.helper.create({
      data: PrismaHelperMapper.toPrisma(helper),
    })
  }

  async findByEmail(email: string): Promise<Helper | null> {
    const helper = await this.prisma.helper.findUnique({
      where: {
        email,
      },
    })

    if (!helper) {
      return null
    }

    return PrismaHelperMapper.toDomain(helper)
  }
}
