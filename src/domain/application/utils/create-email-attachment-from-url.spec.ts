import { makeAttachment } from "test/factories/make-attachment"
import { FakeDownloader } from "test/storage/fake-downloader"

import { createEmailAttachmentsFromUrls } from "./create-email-attachment-from-url"

const fakeDownloader = new FakeDownloader()

describe("createEmailAttachmentsFromUrls", () => {
  it("should create email attachments from valid urls", async () => {
    const attachmentsToFetch = [
      makeAttachment({ title: "file-1.zip" }),
      makeAttachment({ title: "file-2.zip" }),
    ]

    const [error, result] = await createEmailAttachmentsFromUrls(
      attachmentsToFetch,
      {
        downloader: fakeDownloader,
      },
    )

    expect(error).toEqual(undefined)

    expect(result).toHaveLength(2)
    expect(result && result[0].filename).toBe("file-1.zip")
    expect(result && result[0].content).toEqual(Buffer.from("file content ok"))
    expect(result && result[1].filename).toBe("file-2.zip")
    expect(result && result[1].content).toEqual(Buffer.from("file content ok"))
  })

  it("should filter out attachments that fail to download", async () => {
    const attachmentsToProcess = [
      makeAttachment({ title: "file-ok.zip" }),
      makeAttachment({
        title: "file-fail.zip",
        url: "http://fake-storage/invalid-file.zip",
      }),
    ]

    const [error, result, warn] = await createEmailAttachmentsFromUrls(
      attachmentsToProcess,
      {
        downloader: fakeDownloader,
      },
    )

    expect(error).toEqual(undefined)
    expect(warn).toEqual({
      code: "ATTACHMENT_PROCESSING_ERROR",
      message: "One or more attachments failed to be processed.",
      details: ["http://fake-storage/invalid-file.zip"],
    })

    expect(result).toHaveLength(1)
    expect(result && result[0].filename).toBe("file-ok.zip")
  })
})
