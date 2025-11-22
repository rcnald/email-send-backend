import { Prisma, Helper as PrismaHelper } from "@prisma/client"

import { Helper } from "@/domain/enterprise/entities/helper"

export class PrismaHelperMapper {
  static toPrisma(helper: Helper): Prisma.HelperUncheckedCreateInput {
    return {
      id: helper.id,
      name: helper.name,
      email: helper.email,
      password: helper.password,
      createdAt: helper.createdAt,
      updatedAt: helper.updatedAt,
    }
  }

  static toDomain(data: PrismaHelper): Helper {
    return Helper.create(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      data.id,
    )
  }
}
