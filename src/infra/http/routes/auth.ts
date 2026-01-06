import { Request, Response, Router } from "express"

import { makeAuthenticate } from "@/infra/factories/make-authenticate"
import { makeRefreshToken } from "@/infra/factories/make-refresh-token"
import { makeRegisterUser } from "@/infra/factories/make-register-user"

export const createAuthRoutes = () => {
  const authRoutes = Router()

  const { authenticateController } = makeAuthenticate()
  const { refreshTokenController } = makeRefreshToken()
  const { createHelperController } = makeRegisterUser()

  authRoutes.post("/register", (request: Request, response: Response) => {
    createHelperController.handle(request, response)
  })

  authRoutes.post("/login", (request: Request, response: Response) => {
    authenticateController.handle(request, response)
  })

  authRoutes.patch("/token/refresh", (request: Request, response: Response) => {
    refreshTokenController.handle(request, response)
  })

  return authRoutes
}
