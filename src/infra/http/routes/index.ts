import { Router } from "express"

import { createAttachmentRoutes } from "./attachment"
import { createClientRoutes } from "./client"
import { createEmailRoutes } from "./email"

export function createRouter() {
  const router = Router()

  router.use("/attachments", createAttachmentRoutes())
  router.use("/emails", createEmailRoutes())
  router.use("/clients", createClientRoutes())

  return router
}
