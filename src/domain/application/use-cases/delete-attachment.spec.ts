import { makeAttachment } from "test/factories/make-attachment"
import { InMemoryAttachmentRepository } from "test/in-memory-repositories/in-memory-attachment-repository"
import { FakeDeleter } from "test/storage/fake-deleter"

import { DeleteAttachmentUseCase } from "./delete-attachment"

let inMemoryAttachmentRepository: InMemoryAttachmentRepository
let fakeDeleter: FakeDeleter
let sut: DeleteAttachmentUseCase

describe("DeleteAttachmentUseCase", () => {
  beforeEach(() => {
    inMemoryAttachmentRepository = new InMemoryAttachmentRepository()
    fakeDeleter = new FakeDeleter()
    sut = new DeleteAttachmentUseCase(inMemoryAttachmentRepository, fakeDeleter)
  })

  it("should return an error if attachment doesn't exists", async () => {
    const [error] = await sut.execute({ attachmentId: "non-existing-id" })

    expect(error).toEqual({
      code: "ATTACHMENT_NOT_FOUND",
      message: "Attachment not found",
      data: { attachmentId: "non-existing-id" },
    })
  })

  it("should return an error if attachment failed to be deleted", async () => {
    const attachment = makeAttachment({}, "fail-delete-id")

    await inMemoryAttachmentRepository.create(attachment)

    const [error] = await sut.execute({ attachmentId: attachment.id })

    expect(error).toEqual({
      code: "FAILED_TO_DELETE",
      message: "Failed to delete file",
      data: {
        attachmentId: "fail-delete-id",
      },
    })
  })

  it("should return an error if attachment is in use", async () => {
    const attachment = makeAttachment({ mailId: "mail-id" }, "in-use-id")

    await inMemoryAttachmentRepository.create(attachment)

    const [error] = await sut.execute({ attachmentId: attachment.id })

    expect(error).toEqual({
      code: "ATTACHMENT_IN_USE",
      message: "Attachment is in use",
      data: { attachmentId: "in-use-id", attachmentTitle: attachment.title },
    })
  })

  it("should return an error if attachment is not found on server", async () => {
    const attachment = makeAttachment({}, "non-existent-on-server-id")

    await inMemoryAttachmentRepository.create(attachment)

    const [error] = await sut.execute({ attachmentId: attachment.id })

    expect(error).toEqual({
      code: "ATTACHMENT_NOT_FOUND_ON_SERVER",
      message: "Attachment not found on server",
      data: { attachmentId: attachment.id },
    })
  })

  it("should delete the attachment successfully", async () => {
    const attachment = makeAttachment({})

    await inMemoryAttachmentRepository.create(attachment)

    const [error] = await sut.execute({ attachmentId: attachment.id })

    expect(error).toBeUndefined()
    expect(inMemoryAttachmentRepository.attachments).toHaveLength(0)
  })
})
