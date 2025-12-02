import { Request, Response, Router } from "express"

import { makeAuthenticate } from "@/infra/factories/make-authenticate"
import { makeRefreshToken } from "@/infra/factories/make-refresh-token"

export const createAuthRoutes = () => {
  const authRoutes = Router()

  const { authenticateController } = makeAuthenticate()
  const { refreshTokenController } = makeRefreshToken()

  authRoutes.post("/login", (request: Request, response: Response) =>
    authenticateController.handle(request, response),
  )

  authRoutes.post("/refresh", (request: Request, response: Response) =>
    refreshTokenController.handle(request, response),
  )

  return authRoutes
}
