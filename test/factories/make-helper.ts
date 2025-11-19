import { faker } from "@faker-js/faker"

import { Helper, HelperProps } from "@/domain/enterprise/entities/helper"

export const makeHelper = (
  { name, email, password }: Partial<HelperProps> = {},
  id?: string,
) => {
  const helper = Helper.create(
    {
      name: name ?? faker.company.name(),
      email: email ?? `${faker.person.firstName()}@email.com`,
      password: password ?? faker.internet.password(),
    },
    id,
  )

  return helper
}
