import { PrismaClient } from "@prisma/client"

import { SendEmailUseCase } from "@/domain/application/use-cases/send-email"

import { PrismaAttachmentRepository } from "../database/prisma/repositories/prisma-attachment-repository"
import { PrismaClientRepository } from "../database/prisma/repositories/prisma-client-repository"
import { PrismaMailRepository } from "../database/prisma/repositories/prisma-mail-repository"
import { RendEmailSender } from "../email/resend"
import { getEnv } from "../env"
import { SentEmailController } from "../http/controller/send-email"
import { createS3Client } from "../lib/tebi"
import { TebiStorage } from "../storage/tebi"

export const makeSentEmail = () => {
  const env = getEnv()
  const tebiClient = createS3Client()
  const prisma = new PrismaClient()
  const mailRepository = new PrismaMailRepository(prisma)
  const clientRepository = new PrismaClientRepository(prisma)
  const attachmentRepository = new PrismaAttachmentRepository(prisma)
  const emailSender = new RendEmailSender()
  const renamer = new TebiStorage(tebiClient, env)
  const downloader = new TebiStorage(tebiClient, env)

  const sentEmailUseCase = new SendEmailUseCase(
    mailRepository,
    clientRepository,
    attachmentRepository,
    renamer,
    emailSender,
    downloader,
  )

  const sentEmailController = new SentEmailController(sentEmailUseCase)

  return { sentEmailController }
}
