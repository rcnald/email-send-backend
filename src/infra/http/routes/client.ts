import { Request, Response, Router } from "express"

import { makeFetchClients } from "@/infra/factories/make-fetch-clients"

export const createClientRoutes = () => {
  const clientsRoutes = Router()

  const { fetchClientsController } = makeFetchClients()

  clientsRoutes.get("/", (request: Request, response: Response) =>
    fetchClientsController.handle(request, response),
  )

  return clientsRoutes
}
