import { Request, Response, Router } from "express"
import multer from "multer"

import { makeDeleteAttachment } from "@/infra/factories/make-delete-attachment"
import { makeUpdateAndCreateAttachment } from "@/infra/factories/make-update-and-create-attachment"

const upload = multer({ storage: multer.memoryStorage() })

export const createAttachmentRoutes = () => {
  const attachmentsRoutes = Router()

  const { updateAndCreateAttachmentController } =
    makeUpdateAndCreateAttachment()

  const { deleteAttachmentController } = makeDeleteAttachment()

  attachmentsRoutes.post(
    "/",
    upload.single("file"),
    async (request: Request, response: Response) => {
      await updateAndCreateAttachmentController.handle(request, response)
    },
  )

  attachmentsRoutes.delete(
    "/:id/delete",
    async (request: Request, response: Response) => {
      await deleteAttachmentController.handle(request, response)
    },
  )

  return attachmentsRoutes
}
