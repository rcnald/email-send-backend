import { Router } from "express"

import { attachmentsRoutes } from "./attachment.ts"

const router = Router()

router.use("/attachments", attachmentsRoutes)

export { router }
