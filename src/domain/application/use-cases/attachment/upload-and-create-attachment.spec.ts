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
    const [error] = await sut.execute({
      fileName: "file.txt",
      fileType: "application/txt",
      body: Buffer.from("file content"),
    })

    expect(error).toEqual({
      code: "INVALID_FILE_TYPE",
      message: "Invalid file type",
      data: { invalidFileType: "application/txt" },
    })
  })

  it("should return error if upload fails", async () => {
    const [error] = await sut.execute({
      fileName: "invalid.zip",
      fileType: "application/zip",
      body: Buffer.from("file content"),
    })

    expect(error).toEqual({
      code: "FAILED_TO_UPLOAD",
      message: "Failed to upload file",
    })
  })

  it("should upload the file and create an attachment if file type is valid", async () => {
    const [error, result] = await sut.execute({
      fileName: "file.zip",
      fileType: "application/zip",
      body: Buffer.from("file content"),
    })

    expect(error).toBeUndefined()
    expect(result?.attachment).toEqual(
      expect.objectContaining({
        title: "file.zip",
        url: "http://fakeurl.com/file.zip",
      }),
    )
  })
})
