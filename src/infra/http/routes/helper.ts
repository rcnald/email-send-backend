import { Request, Response, Router } from "express"

import { makeRegisterUser } from "@/infra/factories/make-register-user"

export const createHelperRoutes = () => {
  const helperRoutes = Router()

  const { createHelperController } = makeRegisterUser()

  helperRoutes.post("/", async (request: Request, response: Response) =>
    createHelperController.handle(request, response),
  )

  return helperRoutes
}
