import { PrismaClient } from "@prisma/client";

import { SendEmailUseCase } from "@/domain/application/use-cases/email/send-email";

import { PrismaAttachmentRepository } from "../database/prisma/repositories/prisma-attachment-repository";
import { PrismaClientRepository } from "../database/prisma/repositories/prisma-client-repository";
import { PrismaHelperRepository } from "../database/prisma/repositories/prisma-helper-repository";
import { PrismaMailRepository } from "../database/prisma/repositories/prisma-mail-repository";
import { RendEmailSender } from "../email/resend";
import { getEnv } from "../env";
import { SentEmailController } from "../http/controllers/email/send-email";
import { createS3Client } from "../lib/tebi";
import { TebiStorage } from "../storage/tebi";

export const makeSentEmail = () => {
  const env = getEnv();
  const tebiClient = createS3Client();
  const prisma = new PrismaClient();
  const mailRepository = new PrismaMailRepository(prisma);
  const clientRepository = new PrismaClientRepository(prisma);
  const attachmentRepository = new PrismaAttachmentRepository(prisma);
  const helperRepository = new PrismaHelperRepository(prisma);
  const emailSender = new RendEmailSender();
  const renamer = new TebiStorage(tebiClient, env);
  const downloader = new TebiStorage(tebiClient, env);

  const sentEmailUseCase = new SendEmailUseCase(
    mailRepository,
    clientRepository,
    attachmentRepository,
    helperRepository,
    renamer,
    emailSender,
    downloader
  );

  const sentEmailController = new SentEmailController(sentEmailUseCase);

  return { sentEmailController };
};
