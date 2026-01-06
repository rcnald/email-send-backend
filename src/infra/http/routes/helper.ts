import { Request, Response, Router } from "express"

import { makeGetProfile } from "@/infra/factories/make-get-profile"

export const createHelperRoutes = () => {
  const helpersRoutes = Router()

  const { getProfileController } = makeGetProfile()

  helpersRoutes.get("/me", (request: Request, response: Response) =>
    getProfileController.handle(request, response),
  )

  return helpersRoutes
}
