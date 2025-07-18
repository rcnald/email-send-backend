import { Router } from "express"

import { createAttachmentRoutes } from "./attachment"
import { createEmailRoutes } from "./email"

export function createRouter() {
  const router = Router()

  router.use("/attachments", createAttachmentRoutes())
  router.use("/emails", createEmailRoutes())

  return router
}
