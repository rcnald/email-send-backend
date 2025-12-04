import { PrismaClient } from "@prisma/client"

import { CreateClientUseCase } from "@/domain/application/use-cases/client/create-client"

import { PrismaClientRepository } from "../database/prisma/repositories/prisma-client-repository"
import { PrismaHelperRepository } from "../database/prisma/repositories/prisma-helper-repository"
import { CreateClientController } from "../http/controllers/client/create-client"

export const makeCreateClient = () => {
  const prisma = new PrismaClient()
  const clientRepository = new PrismaClientRepository(prisma)
  const helperRepository = new PrismaHelperRepository(prisma)

  const createClientUseCase = new CreateClientUseCase(
    clientRepository,
    helperRepository,
  )

  const createClientController = new CreateClientController(createClientUseCase)

  return { createClientController }
}
