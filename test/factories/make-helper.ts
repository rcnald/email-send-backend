import { faker } from "@faker-js/faker"
import { PrismaClient } from "@prisma/client"

import { UniqueId } from "@/core/entities/value-objects/unique-id"
import { Helper, HelperProps } from "@/domain/enterprise/entities/helper"
import { Email } from "@/domain/enterprise/entities/value-object/email"
import { BcryptHasher } from "@/infra/cryptography/bcrypt-hasher"
import { JwtEncrypter } from "@/infra/cryptography/jwt-encrypter"

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

interface MakePrismaHelperResult {
  helper: Helper
  token?: string
  plainPassword?: string
}

export class HelperFactory {
  constructor(
    private prisma: PrismaClient,
    private encrypter: JwtEncrypter = new JwtEncrypter(),
    private hasher: BcryptHasher = new BcryptHasher(),
  ) {}

  async makePrismaHelper(
    props: Partial<HelperProps>,
    { authenticated = false }: { authenticated?: boolean } = {},
    id?: UniqueId,
  ): Promise<MakePrismaHelperResult> {
    let hashedPassword: string | undefined

    const plainPassword = props.password ?? faker.internet.password()

    if (authenticated) {
      hashedPassword = await this.hasher.hash(plainPassword)
    }

    const helper = makeHelper(
      {
        ...props,
        password: hashedPassword ?? plainPassword,
      },
      id,
    )

    await this.prisma.helper.create({
      data: {
        id: helper.id.value,
        name: helper.name,
        email: helper.email.value,
        password: helper.password,
      },
    })

    let token: string | undefined

    if (authenticated) {
      token = this.encrypter.encrypt({
        sub: helper.id.value,
        type: "access",
        expiresIn: "15m",
      })

      return {
        helper,
        token,
        plainPassword,
      }
    }

    return {
      helper,
    }
  }
}
