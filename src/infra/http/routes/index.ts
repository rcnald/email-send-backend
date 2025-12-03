import { Router } from "express"

import { JwtEncrypter } from "@/infra/cryptography/jwt-encrypter"

import { authMiddleware } from "../middlewares/auth"
import { createAttachmentRoutes } from "./attachment"
import { createAuthRoutes } from "./auth"
import { createClientRoutes } from "./client"
import { createEmailRoutes } from "./email"

export function createRouter() {
  const jwtEncrypter = new JwtEncrypter()
  const router = Router()

  router.use("/auth", createAuthRoutes())

  router.use(authMiddleware(jwtEncrypter))

  router.use("/attachments", createAttachmentRoutes())
  router.use("/emails", createEmailRoutes())
  router.use("/clients", createClientRoutes())

  return router
}
