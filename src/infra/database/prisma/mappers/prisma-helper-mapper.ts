import { Prisma, Helper as PrismaHelper } from "@prisma/client"

import { Helper } from "@/domain/enterprise/entities/helper"
import { Email } from "@/domain/enterprise/entities/value-object/email"
import { UniqueId } from "@/core/entities/value-objects/unique-id"

export class PrismaHelperMapper {
  static toPrisma(helper: Helper): Prisma.HelperUncheckedCreateInput {
    return {
      id: helper.id.value,
      name: helper.name,
      email: helper.email.value,
      password: helper.password,
      createdAt: helper.createdAt,
      updatedAt: helper.updatedAt,
    }
  }

  static toDomain(data: PrismaHelper): Helper {
    return Helper.create(
      {
        name: data.name,
        email: Email.fromPersistence(data.email),
        password: data.password,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      new UniqueId(data.id),
    )
  }
}
