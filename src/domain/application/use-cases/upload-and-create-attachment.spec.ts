import { InMemoryAttachmentRepository } from "test/in-memory-repositories/in-memory-attachment-repository"
import { FakeUploader } from "test/storage/fake-uploader"

import { UploadAndCreateAttachmentUseCase } from "./upload-and-create-attachment"

const inMemoryAttachmentRepository = new InMemoryAttachmentRepository()
const fakeUploader: FakeUploader = new FakeUploader()
const sut: UploadAndCreateAttachmentUseCase =
  new UploadAndCreateAttachmentUseCase(
    inMemoryAttachmentRepository,
    fakeUploader,
  )

describe("UploadAndCreateAttachmentUseCase", () => {
  it("should return null if file type is not valid", async () => {
    const request = {
      fileName: "test.txt",
      fileType: "txt",
      body: Buffer.from("test content"),
    }

    const result = await sut.execute(request)

    expect(result).toBeNull()
  })

  it("should upload the file and create an attachment if file type is valid", async () => {
    const request = {
      fileName: "test.zip",
      fileType: "zip",
      body: Buffer.from("test content"),
    }

    const result = await sut.execute(request)

    expect(result?.attachment).toEqual(
      expect.objectContaining({
        title: "test.zip",
        url: "http://fakeurl.com/test.zip",
      }),
    )
  })
})
