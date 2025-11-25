import { faker } from "@faker-js/faker"
import { PrismaClient } from "@prisma/client"

import { UniqueId } from "@/core/entities/value-objects/unique-id"
import { bad, nice } from "@/core/error"
import { Client, ClientProps } from "@/domain/enterprise/entities/client"
import { Email } from "@/domain/enterprise/entities/value-object/email"

export const makeClient = (
  { name, CNPJ, accountant }: Partial<ClientProps> = {},
  id?: string,
) => {
  const client = Client.create(
    {
      name: name ?? faker.company.name(),
      CNPJ: CNPJ ?? faker.string.numeric(14),
      accountant: {
        name: accountant?.name ?? faker.person.firstName(),
        email:
          accountant?.email ??
          Email.unsafeCreate(`${faker.person.firstName()}@email.com`),
      },
    },
    new UniqueId(id),
  )

  return client
}

export class ClientFactory {
  constructor(private prisma: PrismaClient) {}

  async makePrismaClient(props: Partial<ClientProps> = {}, id?: string) {
    const client = makeClient(props, id)

    await this.prisma.client.create({
      data: {
        id: client.id.value,
        name: client.name,
        CNPJ: client.CNPJ,
        accountantName: client.accountant.name,
        accountantEmail: client.accountant.email.value,
      },
    })

    return client
  }
}
