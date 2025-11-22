import { PrismaClient } from "@prisma/client"

import { RegisterUserUseCase } from "@/domain/application/use-cases/register-user"

import { BcryptHasher } from "../criptography/bcrypt"
import { PrismaHelperRepository } from "../database/prisma/repositories/prisma-helper-repository"
import { RegisterUserController } from "../http/controllers/register-user"

export const makeRegisterUser = () => {
  const prisma = new PrismaClient()
  const helperRepository = new PrismaHelperRepository(prisma)
  const bcryptHasher = new BcryptHasher()

  const createHelperUseCase = new RegisterUserUseCase(
    helperRepository,
    bcryptHasher,
  )

  const createHelperController = new RegisterUserController(createHelperUseCase)
  return { createHelperController }
}
