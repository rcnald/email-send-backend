import type { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import type { ClientRepository } from "@/domain/application/repositories/client-repository";
import type { Client } from "@/domain/enterprise/entities/client";
import type { ClientWithStatus } from "@/domain/enterprise/entities/value-object/client-with-status";
import { PrismaClientMapper } from "../mappers/prisma-client-mapper";
import { PrismaClientWithStatusMapper } from "../mappers/prisma-client-with-status-mapper";

export class PrismaClientRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(client: Client): Promise<void> {
    await this.prisma.client.create({
      data: PrismaClientMapper.toPrisma(client),
    });
  }

  async find(id: string): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return null;
    }

    return PrismaClientMapper.toDomain(client);
  }

  async findMany(): Promise<Client[]> {
    const clients = await this.prisma.client.findMany();

    return clients.map(PrismaClientMapper.toDomain);
  }

  async findManyWithStatus(): Promise<ClientWithStatus[]> {
    const startOfMonth = dayjs().startOf("month").toDate();
    const endOfMonth = dayjs().endOf("month").toDate();

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
    });

    return clients.map((client) =>
      PrismaClientWithStatusMapper.toDomain(client)
    );
  }

  async findManyWithStatusByHelperId(
    helperId: string
  ): Promise<ClientWithStatus[]> {
    const startOfMonth = dayjs().startOf("month").toDate();
    const endOfMonth = dayjs().endOf("month").toDate();

    const clients = await this.prisma.client.findMany({
      include: {
        Mail: {
          where: {
            sentAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
            helperId,
          },
        },
      },
    });

    return clients.map((client) =>
      PrismaClientWithStatusMapper.toDomain(client)
    );
  }

  async findByCNPJ(CNPJ: string): Promise<Client | null> {
    const client = await this.prisma.client.findFirst({
      where: { CNPJ },
    });

    if (!client) {
      return null;
    }

    return PrismaClientMapper.toDomain(client);
  }
}
