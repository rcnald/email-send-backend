import { faker } from "@faker-js/faker"
import { PrismaClient } from "@prisma/client"

import { UniqueId } from "@/core/entities/value-objects/unique-id"
import { Helper, HelperProps } from "@/domain/enterprise/entities/helper"
import { Email } from "@/domain/enterprise/entities/value-object/email"

export const makeHelper = (
  { name, email, password }: Partial<HelperProps> = {},
  id?: UniqueId,
) => {
  const helper = Helper.create(
    {
      name: name ?? faker.company.name(),
      email:
        email ?? Email.unsafeCreate(`${faker.person.firstName()}@email.com`),
      password: password ?? faker.internet.password(),
    },
    id,
  )

  return helper
}

export class HelperFactory {
  constructor(private prisma: PrismaClient) {}

  async makePrismaHelper(props: Partial<HelperProps> = {}, id?: string) {
    const helper = makeHelper(props, id ? new UniqueId(id) : undefined)

    await this.prisma.helper.create({
      data: {
        id: helper.id.value,
        name: helper.name,
        email: helper.email.value,
        password: helper.password,
      },
    })

    return helper
  }
}
