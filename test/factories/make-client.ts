import { faker } from "@faker-js/faker"

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
