import { makeAttachment } from "test/factories/make-attachment"
import { makeClient } from "test/factories/make-client"
import { makeSendEmailUseCase } from "test/factories/make-send-email-use-case"
import { InMemoryAttachmentRepository } from "test/in-memory-repositories/in-memory-attachment-repository"
import { InMemoryClientRepository } from "test/in-memory-repositories/in-memory-client-repository"
import { InMemoryMailRepository } from "test/in-memory-repositories/in-memory-mail-repository"
import { FakeDownloader } from "test/storage/fake-downloader"

import { Attachment } from "@/domain/enterprise/entities/attachment"
import { Client } from "@/domain/enterprise/entities/client"
import { createEmailAttachmentsFromUrls } from "@/domain/enterprise/utils/create-email-attachment-from-url"

import { SendEmailUseCase } from "./send-email"

vi.mock("@/domain/enterprise/utils/create-email-attachment-from-url", () => ({
  createEmailAttachmentsFromUrls: vi.fn(),
}))

describe("SentEmailUseCase", () => {
  let inMemoryMailRepository: InMemoryMailRepository
  let inMemoryClientRepository: InMemoryClientRepository
  let inMemoryAttachmentRepository: InMemoryAttachmentRepository
  let fakeDownloader: FakeDownloader
  let sut: SendEmailUseCase

  beforeEach(() => {
    const setup = makeSendEmailUseCase()

    sut = setup.sendEmailUseCase
    inMemoryAttachmentRepository = setup.attachmentRepository
    inMemoryClientRepository = setup.clientRepository
    inMemoryMailRepository = setup.mailRepository
    fakeDownloader = setup.downloader
  })

  it("should send an email with valid data", async () => {
    const client = makeClient()

    inMemoryClientRepository.create(client)

    const attachment = makeAttachment()

    inMemoryAttachmentRepository.create(attachment)

    vi.mocked(createEmailAttachmentsFromUrls).mockResolvedValue([
      undefined,
      [
        {
          filename: attachment.title,
          content: Buffer.from("file-content"),
          type: "application/zip",
        },
      ],
    ])

    await sut.execute({
      clientId: client.id,
      attachmentIds: [attachment.id],
    })

    expect(createEmailAttachmentsFromUrls).toHaveBeenCalledWith([attachment], {
      downloader: fakeDownloader,
    })
    expect(inMemoryMailRepository.find(client.id)).not.toBeNull()
  })

  it("should return error if client does not exist", async () => {
    const [error, result] = await sut.execute({
      clientId: "non-existent-client",
      attachmentIds: ["attachment-id-1"],
    })

    expect(error).toEqual({
      code: "CLIENT_NOT_FOUND",
      message: "Client not found",
    })
    expect(result).toBeUndefined()
  })

  it("should filter out invalid attachments", async () => {
    const client = makeClient()

    inMemoryClientRepository.create(client)

    const validAttachment = makeAttachment()

    inMemoryAttachmentRepository.create(validAttachment)

    vi.mocked(createEmailAttachmentsFromUrls).mockResolvedValue([
      undefined,
      [
        {
          filename: validAttachment.title,
          content: Buffer.from("file-content"),
          type: "application/zip",
        },
      ],
    ])

    await sut.execute({
      clientId: client.id,
      attachmentIds: [validAttachment.id, "invalid-attachment-id"],
    })

    expect(createEmailAttachmentsFromUrls).toHaveBeenCalledWith(
      [validAttachment],
      {
        downloader: fakeDownloader,
      },
    )
  })

  it("should rename attachments and update their URLs", async () => {
    const client = makeClient({ name: "rcnald SA" })

    inMemoryClientRepository.create(client)

    const attachment = makeAttachment()

    inMemoryAttachmentRepository.create(attachment)

    vi.mocked(createEmailAttachmentsFromUrls).mockResolvedValue([
      undefined,
      [
        {
          filename: attachment.title,
          content: Buffer.from("file-content"),
          type: "application/zip",
        },
      ],
    ])

    await sut.execute({
      clientId: client.id,
      attachmentIds: [attachment.id, "invalid-attachment"],
    })

    const clientName = client.name.toLowerCase().replace(/\s+/g, "-")

    expect(inMemoryAttachmentRepository.attachments[0]).toEqual(
      expect.objectContaining({
        title: `arquivos-fiscais-${clientName}-do-mes-de-junho-0.zip`,
      }),
    )
  })
})
