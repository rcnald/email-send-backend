import { PrismaClient } from "@prisma/client"

import { UploadAndCreateAttachmentUseCase } from "@/domain/application/use-cases/upload-and-create-attachment"

import { PrismaAttachmentRepository } from "../database/prisma/repositories/prisma-attachment-repository"
import { UpdateAndCreateAttachmentController } from "../http/controller/update-and-create-attachment"
import { TebiStorage } from "../storage/tebi"

export const makeUpdateAndCreateAttachment = () => {
  const prisma = new PrismaClient()
  const attachmentRepository = new PrismaAttachmentRepository(prisma)
  const uploader = new TebiStorage()

  const updateAndCreateAttachmentUseCase = new UploadAndCreateAttachmentUseCase(
    attachmentRepository,
    uploader,
  )

  const updateAndCreateAttachmentController =
    new UpdateAndCreateAttachmentController(updateAndCreateAttachmentUseCase)

  return { updateAndCreateAttachmentController }
}
