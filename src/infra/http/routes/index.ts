import { Router } from "express"

import { createAttachmentRoutes } from "./attachment"
import { createAuthRoutes } from "./auth"
import { createClientRoutes } from "./client"
import { createEmailRoutes } from "./email"
import { createHelperRoutes } from "./helper"

export function createRouter() {
  const router = Router()

  router.use("/attachments", createAttachmentRoutes())
  router.use("/emails", createEmailRoutes())
  router.use("/clients", createClientRoutes())
  router.use("/helpers", createHelperRoutes())
  router.use("/auth", createAuthRoutes())

  return router
}
