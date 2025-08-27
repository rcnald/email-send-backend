import { PrismaClient } from "@prisma/client"

import { ClientRepository } from "@/domain/application/repositories/client-repository"
import { Client } from "@/domain/enterprise/entities/client"

import { PrismaClientMapper } from "../mappers/prisma-client-mapper"
import { ClientWithStatus } from "@/domain/enterprise/entities/value-object/client-with-status"
import { PrismaClientWithStatusMapper } from "../mappers/prisma-client-with-status-mapper"
import dayjs from "dayjs"

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

  async findMany(): Promise<Client[]> {
    const clients = await this.prisma.client.findMany()

    return clients.map(PrismaClientMapper.toDomain)
  }

  async findManyWithStatus(): Promise<ClientWithStatus[]> {
    const startOfMonth = dayjs().startOf("month").toDate()
    const endOfMonth = dayjs().endOf("month").toDate()

    const clients = await this.prisma.client.findMany({
      include: {
        Mail: {
          where: {
            sentAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        },
      },
    })

    return clients.map((client) =>
      PrismaClientWithStatusMapper.toDomain(client),
    )
  }
}
