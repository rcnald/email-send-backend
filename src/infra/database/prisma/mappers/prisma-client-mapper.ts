import { Client as PrismaClient, Prisma } from "@prisma/client"

import { Client } from "@/domain/enterprise/entities/client"
import { Email } from "@/domain/enterprise/entities/value-object/email"
import { UniqueId } from "@/core/entities/value-objects/unique-id"

export class PrismaClientMapper {
  static toPrisma(client: Client): Prisma.ClientUncheckedCreateInput {
    return {
      id: client.id.value,
      helperId: client.helperId.value,
      name: client.name,
      CNPJ: client.CNPJ,
      accountantName: client.accountant.name,
      accountantEmail: client.accountant.email.value,
    }
  }

  static toDomain(data: PrismaClient): Client {
    return Client.create(
      {
        name: data.name,
        helperId: new UniqueId(data.helperId),
        CNPJ: data.CNPJ,
        accountant: {
          name: data.accountantName,
          email: Email.fromPersistence(data.accountantEmail),
        },
      },
      new UniqueId(data.id),
    )
  }
}
