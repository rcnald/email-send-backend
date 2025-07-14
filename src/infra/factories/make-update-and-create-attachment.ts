import { UploadAndCreateAttachmentUseCase } from "@/domain/application/use-cases/upload-and-create-attachment"

import { PrismaAttachmentRepository } from "../database/prisma/repositories/prisma-attachment-repository"
import { UpdateAndCreateAttachmentController } from "../http/controller/update-and-create-attachment"
import { prisma } from "../lib/prisma"
import { TebiUploader } from "../storage/tebi-storage"

export const makeUpdateAndCreateAttachment = () => {
  const attachmentRepository = new PrismaAttachmentRepository(prisma)
  const uploader = new TebiUploader()

  const updateAndCreateAttachmentUseCase = new UploadAndCreateAttachmentUseCase(
    attachmentRepository,
    uploader,
  )

  const updateAndCreateAttachmentController =
    new UpdateAndCreateAttachmentController(updateAndCreateAttachmentUseCase)

  return { updateAndCreateAttachmentController }
}
