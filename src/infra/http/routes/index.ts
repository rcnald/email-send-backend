import { Router } from "express"

// import { configureDependencies } from "../../container"
import { createAttachmentRoutes } from "./attachment"

export function createRouter() {
  // configureDependencies()

  const router = Router()

  router.use("/attachments", createAttachmentRoutes())
  // router.use("/emails", createEmailRoutes()) // Para futuras rotas

  return router
}
