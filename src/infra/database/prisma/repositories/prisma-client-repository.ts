import { PrismaClient } from "@prisma/client"

import { ClientRepository } from "@/domain/application/repositories/client-repository"
import { Client } from "@/domain/enterprise/entities/client"

import { PrismaClientMapper } from "../mappers/prisma-client-mapper"

export class PrismaClientRepository implements ClientRepository {
  constructor(private prisma: PrismaClient) {}

  async create(client: Client): Promise<void> {
    await this.prisma.client.create({
      data: PrismaClientMapper.toPrisma(client),
    })
  }

  async find(id: string): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    })

    if (!client) {
      return null
    }

    return PrismaClientMapper.toDomain(client)
  }
}
