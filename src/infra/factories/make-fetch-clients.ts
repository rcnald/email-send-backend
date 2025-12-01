import { PrismaClient } from "@prisma/client"

import { FetchClientsUseCase } from "@/domain/application/use-cases/client/fetch-clients"

import { PrismaClientRepository } from "../database/prisma/repositories/prisma-client-repository"
import { FetchClientsController } from "../http/controllers/client/fetch-clients"

export const makeFetchClients = () => {
  const prisma = new PrismaClient()
  const clientRepository = new PrismaClientRepository(prisma)

  const fetchClientsUseCase = new FetchClientsUseCase(clientRepository)

  const fetchClientsController = new FetchClientsController(fetchClientsUseCase)

  return { fetchClientsController }
}
