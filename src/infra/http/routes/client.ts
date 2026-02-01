import { type Request, type Response, Router } from "express";

import { makeCreateClient } from "@/infra/factories/make-create-client";
import { makeFetchClients } from "@/infra/factories/make-fetch-clients";

export const createClientRoutes = () => {
  const clientsRoutes = Router();

  const { fetchClientsController } = makeFetchClients();
  const { createClientController } = makeCreateClient();

  clientsRoutes.get("/", (request: Request, response: Response) =>
    fetchClientsController.handle(request, response)
  );

  clientsRoutes.post("/", async (request: Request, response: Response) =>
    createClientController.handle(request, response)
  );

  return clientsRoutes;
};
