import { Request, Response, Router } from "express"
import multer from "multer"

import { makeUpdateAndCreateAttachment } from "@/infra/factories/make-update-and-create-attachment"

const upload = multer({ storage: multer.memoryStorage() })

export function createAttachmentRoutes() {
  const attachmentsRoutes = Router()

  const { updateAndCreateAttachmentController } =
    makeUpdateAndCreateAttachment()

  attachmentsRoutes.post(
    "/",
    upload.single("attachmentFile"),
    async (request: Request, response: Response) => {
      await updateAndCreateAttachmentController.handle(request, response)
    },
  )

  return attachmentsRoutes
}
