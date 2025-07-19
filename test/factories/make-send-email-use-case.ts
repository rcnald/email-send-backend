import { FakeEmailSender } from "test/email/fake-email-sender"
import { InMemoryAttachmentRepository } from "test/in-memory-repositories/in-memory-attachment-repository"
import { InMemoryClientRepository } from "test/in-memory-repositories/in-memory-client-repository"
import { InMemoryMailRepository } from "test/in-memory-repositories/in-memory-mail-repository"
import { FakeDownloader } from "test/storage/fake-downloader"
import { FakeRenamer } from "test/storage/fake-renamer"

import { SentEmailUseCase } from "@/domain/application/use-cases/sent-email"

export const makeSendEmailUseCase = () => {
  const mailRepository = new InMemoryMailRepository()
  const clientRepository = new InMemoryClientRepository()
  const attachmentRepository = new InMemoryAttachmentRepository()
  const emailSender = new FakeEmailSender()
  const renamer = new FakeRenamer()
  const downloader = new FakeDownloader()
  const sendEmailUseCase = new SentEmailUseCase(
    mailRepository,
    clientRepository,
    attachmentRepository,
    renamer,
    emailSender,
    downloader,
  )

  return {
    sendEmailUseCase,
    mailRepository,
    clientRepository,
    attachmentRepository,
    emailSender,
    renamer,
    downloader,
  }
}
