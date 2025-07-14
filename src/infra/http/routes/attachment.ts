import { Router } from "express"
import multer from "multer"

import { makeUpdateAndCreateAttachment } from "@/infra/factories/make-update-and-create-attachment.ts"

const upload = multer({ storage: multer.memoryStorage() })

const attachmentsRoutes = Router()

const { updateAndCreateAttachmentController } = makeUpdateAndCreateAttachment()

attachmentsRoutes.post("/", upload.single("attachmentFile"), (req, res) =>
  updateAndCreateAttachmentController.handle(req, res),
)

export { attachmentsRoutes }
