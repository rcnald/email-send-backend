import { faker } from "@faker-js/faker"
import { PrismaClient } from "@prisma/client"

import { Client, ClientProps } from "@/domain/enterprise/entities/client"

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
        email: accountant?.email ?? `${faker.person.firstName()}@email.com`,
      },
    },
    id,
  )

  return client
}

export class ClientFactory {
  constructor(private prisma: PrismaClient) {}

  async makePrismaClient(
    props: Partial<ClientProps> = {},
    id?: string,
  ): Promise<Client> {
    const client = makeClient(props, id)

    await this.prisma.client.create({
      data: {
        id: client.id,
        name: client.name,
        CNPJ: client.CNPJ,
        accountantName: client.accountant.name,
        accountantEmail: client.accountant.email,
      },
    })

    return client
  }
}
