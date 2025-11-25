import { faker } from "@faker-js/faker"
import { PrismaClient } from "@prisma/client"

import { bad, nice } from "@/core/error"
import { Client, ClientProps } from "@/domain/enterprise/entities/client"
import { Email } from "@/domain/enterprise/entities/value-object/email"

export const makeClient = (
  { name, CNPJ, accountant }: Partial<ClientProps> = {},
  id?: string,
) => {
  const [emailError, email] = Email.create(
    accountant?.email.value ?? `${faker.person.firstName()}@email.com`,
  )

  if (emailError) {
    return bad(emailError)
  }

  const client = Client.create(
    {
      name: name ?? faker.company.name(),
      CNPJ: CNPJ ?? faker.string.numeric(14),
      accountant: {
        name: accountant?.name ?? faker.person.firstName(),
        email,
      },
    },
    id,
  )

  return nice(client)
}

export class ClientFactory {
  constructor(private prisma: PrismaClient) {}

  async makePrismaClient(props: Partial<ClientProps> = {}, id?: string) {
    const [clientError, client] = makeClient(props, id)

    if (clientError) {
      return bad(clientError)
    }

    await this.prisma.client.create({
      data: {
        id: client.id.value,
        name: client.name,
        CNPJ: client.CNPJ,
        accountantName: client.accountant.name,
        accountantEmail: client.accountant.email.value,
      },
    })

    return nice(client)
  }
}
