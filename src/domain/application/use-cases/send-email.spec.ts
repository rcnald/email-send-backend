import { makeAttachment } from "test/factories/make-attachment"
import { makeClient } from "test/factories/make-client"
import { makeSendEmailUseCase } from "test/factories/make-send-email-use-case"
import { InMemoryAttachmentRepository } from "test/in-memory-repositories/in-memory-attachment-repository"
import { InMemoryClientRepository } from "test/in-memory-repositories/in-memory-client-repository"
import { InMemoryMailRepository } from "test/in-memory-repositories/in-memory-mail-repository"

import { SendEmailUseCase } from "./send-email"

describe("SentEmailUseCase", () => {
  let inMemoryMailRepository: InMemoryMailRepository
  let inMemoryClientRepository: InMemoryClientRepository
  let inMemoryAttachmentRepository: InMemoryAttachmentRepository
  let sut: SendEmailUseCase

  beforeEach(() => {
    const setup = makeSendEmailUseCase()

    sut = setup.sendEmailUseCase
    inMemoryAttachmentRepository = setup.attachmentRepository
    inMemoryClientRepository = setup.clientRepository
    inMemoryMailRepository = setup.mailRepository
  })

  it("should send an email with valid data", async () => {
    const client = makeClient()

    inMemoryClientRepository.create(client)

    const attachment = makeAttachment()

    inMemoryAttachmentRepository.create(attachment)

    await sut.execute({
      clientId: client.id,
      attachmentIds: [attachment.id],
    })

    expect(inMemoryMailRepository.find(client.id)).not.toBeNull()
  })

  it("should return error if client does not exist", async () => {
    const [error, result] = await sut.execute({
      clientId: "non-existent-client-id",
      attachmentIds: ["attachment-id-1"],
    })

    expect(error).toEqual({
      code: "CLIENT_NOT_FOUND",
      message: "Client not found",
      data: {
        clientId: "non-existent-client-id",
      },
    })
    expect(result).toBeUndefined()
  })

  it("should not proceed with any not found attachments", async () => {
    const client = makeClient()

    inMemoryClientRepository.create(client)

    const validAttachment = makeAttachment()

    inMemoryAttachmentRepository.create(validAttachment)

    const [error] = await sut.execute({
      clientId: client.id,
      attachmentIds: [validAttachment.id, "invalid-attachment-id"],
    })

    expect(error).toEqual({
      code: "SOME_ATTACHMENTS_NOT_FOUND",
      data: {
        missingIds: ["invalid-attachment-id"],
      },
      message: "Some attachments were not found",
    })
  })

  it("should not proceed with any invalid attachments", async () => {
    const client = makeClient({ name: "invalid SA" })

    inMemoryClientRepository.create(client)

    const validAttachment = makeAttachment()
    const invalidAttachment = makeAttachment()

    inMemoryAttachmentRepository.create(validAttachment)
    inMemoryAttachmentRepository.create(invalidAttachment)

    const [error] = await sut.execute({
      clientId: client.id,
      attachmentIds: [validAttachment.id, invalidAttachment.id],
    })

    const updatedInvalidAttachment =
      inMemoryAttachmentRepository.attachments.find(
        (attachment) => attachment.id === invalidAttachment.id,
      )

    expect(error).toEqual({
      code: "ATTACHMENT_PROCESSING_ERROR",
      message: "One or more attachments failed to be processed.",
      data: {
        details: [updatedInvalidAttachment?.url],
      },
    })
  })

  it("should rename attachments and update their URLs", async () => {
    const client = makeClient({ name: "rcnald SA" })

    inMemoryClientRepository.create(client)

    const attachment = makeAttachment()

    inMemoryAttachmentRepository.create(attachment)

    await sut.execute({
      clientId: client.id,
      attachmentIds: [attachment.id],
    })

    const clientName = client.name.toLowerCase().replace(/\s+/g, "-")

    expect(inMemoryAttachmentRepository.attachments[0]).toEqual(
      expect.objectContaining({
        title: `arquivos-fiscais-${clientName}-do-mes-de-junho-0.zip`,
      }),
    )
  })
})
