import { Router } from "express"

import { makeSentEmail } from "@/infra/factories/make-sent-email"

const emailsRoutes = Router()

const { sentEmailController } = makeSentEmail()

emailsRoutes.post("/", (req, res) => sentEmailController.handle(req, res))

export { emailsRoutes }
