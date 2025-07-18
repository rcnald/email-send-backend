import { SentEmailUseCase } from "@/domain/application/use-cases/sent-email"

import { PrismaAttachmentRepository } from "../database/prisma/repositories/prisma-attachment-repository"
import { PrismaClientRepository } from "../database/prisma/repositories/prisma-client-repository"
import { PrismaMailRepository } from "../database/prisma/repositories/prisma-mail-repository"
import { RendEmailSender } from "../email/resend"
import { SentEmailController } from "../http/controller/sent-email"
import { prisma } from "../lib/prisma"
import { TebiStorage } from "../storage/tebi"

export const makeSentEmail = () => {
  const mailRepository = new PrismaMailRepository(prisma)
  const clientRepository = new PrismaClientRepository(prisma)
  const attachmentRepository = new PrismaAttachmentRepository(prisma)
  const emailSender = new RendEmailSender()
  const renamer = new TebiStorage()

  const sentEmailUseCase = new SentEmailUseCase(
    mailRepository,
    clientRepository,
    attachmentRepository,
    renamer,
    emailSender,
  )

  const sentEmailController = new SentEmailController(sentEmailUseCase)

  return { sentEmailController }
}
