import {
  Client as PrismaClient,
  Prisma,
  Mail as PrismaMail,
} from "@prisma/client"

import { Client } from "@/domain/enterprise/entities/client"
import { ClientWithStatus } from "@/domain/enterprise/entities/value-object/client-with-status"

export type PrismaClientWithStatus = PrismaClient & {
  Mail: PrismaMail[]
}

export class PrismaClientWithStatusMapper {
  static toPrisma(client: Client): Prisma.ClientUncheckedCreateInput {
    return {
      id: client.id,
      name: client.name,
      CNPJ: client.CNPJ,
      accountantName: client.accountant.name,
      accountantEmail: client.accountant.email,
    }
  }

  static toDomain(data: PrismaClientWithStatus): ClientWithStatus {
    return ClientWithStatus.create({
      name: data.name,
      CNPJ: data.CNPJ,
      accountant: {
        name: data.accountantName,
        email: data.accountantEmail,
      },
      clientId: data.id,
      status: data.Mail.length > 0 ? "sent" : "not_sent",
    })
  }
}
