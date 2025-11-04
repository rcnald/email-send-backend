import { PrismaClient } from "@prisma/client"

import { CreateClientUseCase } from "@/domain/application/use-cases/create-client"

import { PrismaClientRepository } from "../database/prisma/repositories/prisma-client-repository"
import { CreateClientController } from "../http/controllers/create-client"

export const makeCreateClient = () => {
  const prisma = new PrismaClient()
  const clientRepository = new PrismaClientRepository(prisma)

  const createClientUseCase = new CreateClientUseCase(clientRepository)

  const createClientController = new CreateClientController(createClientUseCase)

  return { createClientController }
}
