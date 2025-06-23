import { FakeEmailSender } from "test/email/fake-email-sender"
import { InMemoryAttachmentRepository } from "test/in-memory-repositories/in-memory-attachment-repository"
import { InMemoryClientRepository } from "test/in-memory-repositories/in-memory-client-repository"
import { InMemoryMailRepository } from "test/in-memory-repositories/in-memory-mail-repository"

import { Attachment } from "@/domain/enterprise/entities/attachment"
import { Client } from "@/domain/enterprise/entities/client"
import { createEmailAttachmentsFromUrls } from "@/domain/enterprise/utils/create-email-attachment-from-url"

import { SentEmailUseCase } from "./sent-email"

vi.mock("@/domain/enterprise/utils/create-email-attachment-from-url", () => ({
  createEmailAttachmentsFromUrls: vi.fn(),
}))

describe("SentEmailUseCase", () => {
  let inMemoryMailRepository: InMemoryMailRepository
  let inMemoryClientRepository: InMemoryClientRepository
  let inMemoryAttachmentRepository: InMemoryAttachmentRepository
  let fakeEmailSender: FakeEmailSender
  let sut: SentEmailUseCase

  beforeEach(() => {
    inMemoryMailRepository = new InMemoryMailRepository()
    inMemoryClientRepository = new InMemoryClientRepository()
    inMemoryAttachmentRepository = new InMemoryAttachmentRepository()
    fakeEmailSender = new FakeEmailSender()
    sut = new SentEmailUseCase(
      inMemoryMailRepository,
      inMemoryClientRepository,
      inMemoryAttachmentRepository,
      fakeEmailSender,
    )
  })

  it("should send an email with valid data", async () => {
    const client = Client.create(
      {
        name: "Test Client",
        CNPJ: "123456789",
        accountant: { email: "test@email.com", name: "Accountant Name" },
      },
      "client-1",
    )

    inMemoryClientRepository.create(client)

    const attachment = Attachment.create(
      { title: "file", url: "http://example.com/file.zip" },
      "attachment-1",
    )

    inMemoryAttachmentRepository.create(attachment)

    vi.mocked(createEmailAttachmentsFromUrls).mockResolvedValue([
      undefined,
      [{ filename: "file", content: Buffer.from("file-content") }],
    ])

    const request = {
      email: "accountant@example.com",
      clientId: "client-1",
      attachmentIds: ["attachment-1"],
    }

    await sut.execute(request)

    expect(createEmailAttachmentsFromUrls).toHaveBeenCalledWith([attachment])
    expect(inMemoryMailRepository.find("client-1")).not.toBeNull()
  })

  it("should return error if client does not exist", async () => {
    const request = {
      email: "accountant@example.com",
      clientId: "non-existent-client",
      attachmentIds: ["attachment-1"],
    }

    const [error, result] = await sut.execute(request)

    expect(error).toEqual({
      code: "CLIENT_NOT_FOUND",
    })
    expect(result).toBeUndefined()
  })

  it("should filter out invalid attachments", async () => {
    const client = Client.create(
      {
        name: "Test Client",
        CNPJ: "123456789",
        accountant: { email: "test@email.com", name: "Accountant Name" },
      },
      "client-1",
    )

    inMemoryClientRepository.create(client)

    const validAttachment = Attachment.create(
      { title: "file", url: "http://example.com/file.zip" },
      "attachment-1",
    )

    inMemoryAttachmentRepository.create(validAttachment)

    vi.mocked(createEmailAttachmentsFromUrls).mockResolvedValue([
      undefined,
      [{ filename: "file", content: Buffer.from("file-content") }],
    ])

    const request = {
      email: "accountant@example.com",
      clientId: "client-1",
      attachmentIds: ["attachment-1", "invalid-attachment"],
    }

    await sut.execute(request)

    expect(createEmailAttachmentsFromUrls).toHaveBeenCalledWith([
      validAttachment,
    ])
  })
})
