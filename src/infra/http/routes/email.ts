import { Request, Response, Router } from "express"

import { makeSentEmail } from "@/infra/factories/make-sent-email"

export const createEmailRoutes = () => {
  const emailsRoutes = Router()

  const { sentEmailController } = makeSentEmail()

  emailsRoutes.post("/", (request: Request, response: Response) =>
    sentEmailController.handle(request, response),
  )

  return emailsRoutes
}
