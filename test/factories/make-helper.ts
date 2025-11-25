import { faker } from "@faker-js/faker"

import { bad, nice } from "@/core/error"
import { Helper, HelperProps } from "@/domain/enterprise/entities/helper"
import { Email } from "@/domain/enterprise/entities/value-object/email"

export const makeHelper = (
  { name, email, password }: Partial<HelperProps> = {},
  id?: string,
) => {
  const [emailError, emailVO] = Email.create(
    email?.value ?? `${faker.person.firstName()}@email.com`,
  )

  if (emailError) {
    return bad(emailError)
  }

  const helper = Helper.create(
    {
      name: name ?? faker.company.name(),
      email: emailVO,
      password: password ?? faker.internet.password(),
    },
    id,
  )

  return nice(helper)
}
