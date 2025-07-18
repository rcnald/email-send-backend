import { Client as PrismaClient, Prisma } from "@prisma/client"

import { Client } from "@/domain/enterprise/entities/client"

export class PrismaClientMapper {
  static toPrisma(client: Client): Prisma.ClientUncheckedCreateInput {
    return {
      id: client.id,
      name: client.name,
      CNPJ: client.CNPJ,
      accountantName: client.accountant.name,
      accountantEmail: client.accountant.email,
    }
  }

  static toDomain(data: PrismaClient): Client {
    return Client.create(
      {
        name: data.name,
        CNPJ: data.CNPJ,
        accountant: {
          name: data.accountantName,
          email: data.accountantEmail,
        },
      },
      data.id,
    )
  }
}
