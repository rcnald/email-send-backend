import { PrismaClient } from "@prisma/client"

import { DeleteAttachmentUseCase } from "@/domain/application/use-cases/delete-attachment"

import { PrismaAttachmentRepository } from "../database/prisma/repositories/prisma-attachment-repository"
import { getEnv } from "../env"
import { DeleteAttachmentController } from "../http/controllers/delete-attachment"
import { createS3Client } from "../lib/tebi"
import { TebiStorage } from "../storage/tebi"

export const makeDeleteAttachment = () => {
  const env = getEnv()
  const tebiClient = createS3Client()
  const prisma = new PrismaClient()
  const attachmentRepository = new PrismaAttachmentRepository(prisma)
  const deleter = new TebiStorage(tebiClient, env)

  const deleteAttachmentUseCase = new DeleteAttachmentUseCase(
    attachmentRepository,
    deleter,
  )

  const deleteAttachmentController = new DeleteAttachmentController(
    deleteAttachmentUseCase,
  )

  return { deleteAttachmentController }
}
