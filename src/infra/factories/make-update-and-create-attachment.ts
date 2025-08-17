import { PrismaClient } from "@prisma/client"

import { UploadAndCreateAttachmentUseCase } from "@/domain/application/use-cases/upload-and-create-attachment"

import { PrismaAttachmentRepository } from "../database/prisma/repositories/prisma-attachment-repository"
import { getEnv } from "../env"
import { UpdateAndCreateAttachmentController } from "../http/controllers/update-and-create-attachment"
import { createS3Client } from "../lib/tebi"
import { TebiStorage } from "../storage/tebi"

export const makeUpdateAndCreateAttachment = () => {
  const env = getEnv()
  const tebiClient = createS3Client()
  const prisma = new PrismaClient()
  const attachmentRepository = new PrismaAttachmentRepository(prisma)
  const uploader = new TebiStorage(tebiClient, env)

  const updateAndCreateAttachmentUseCase = new UploadAndCreateAttachmentUseCase(
    attachmentRepository,
    uploader,
  )

  const updateAndCreateAttachmentController =
    new UpdateAndCreateAttachmentController(updateAndCreateAttachmentUseCase)

  return { updateAndCreateAttachmentController }
}
