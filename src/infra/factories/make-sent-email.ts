import { PrismaClient } from "@prisma/client"

import { SentEmailUseCase } from "@/domain/application/use-cases/sent-email"

import { PrismaAttachmentRepository } from "../database/prisma/repositories/prisma-attachment-repository"
import { PrismaClientRepository } from "../database/prisma/repositories/prisma-client-repository"
import { PrismaMailRepository } from "../database/prisma/repositories/prisma-mail-repository"
import { RendEmailSender } from "../email/resend"
import { SentEmailController } from "../http/controller/sent-email"
import { TebiStorage } from "../storage/tebi"

export const makeSentEmail = () => {
  const prisma = new PrismaClient()
  const mailRepository = new PrismaMailRepository(prisma)
  const clientRepository = new PrismaClientRepository(prisma)
  const attachmentRepository = new PrismaAttachmentRepository(prisma)
  const emailSender = new RendEmailSender()
  const renamer = new TebiStorage()
  const downloader = new TebiStorage()

  const sentEmailUseCase = new SentEmailUseCase(
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
