import { vi } from "vitest"

import { Downloader } from "@/domain/application/storage/downloader"

import { Attachment } from "../entities/attachment"
import { createEmailAttachmentsFromUrls } from "./create-email-attachment-from-url"

// Mock do Downloader
class MockDownloader extends Downloader {
  constructor(
    private mockImplementation: (url: string) => Promise<{ buffer: Buffer }>,
  ) {
    super()
  }

  async download(url: string): Promise<{ buffer: Buffer }> {
    return this.mockImplementation(url)
  }
}

describe("createEmailAttachmentsFromUrls", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should create email attachments from valid urls", async () => {
    const attachmentsToFetch = [
      Attachment.create({
        title: "file1.zip",
        url: "http://example.com/file1.zip",
      }),
      Attachment.create({
        title: "file2.zip",
        url: "http://example.com/file2.zip",
      }),
    ]

    const mockDownloader = new MockDownloader(async (url: string) => {
      if (url === "http://example.com/file1.zip") {
        return { buffer: Buffer.from("conteúdo do arquivo 1") }
      }
      if (url === "http://example.com/file2.zip") {
        return { buffer: Buffer.from("conteúdo do arquivo 2") }
      }
      throw new Error("URL não encontrada")
    })

    const [error, result] = await createEmailAttachmentsFromUrls(
      attachmentsToFetch,
      {
        downloader: mockDownloader,
      },
    )

    expect(error).toEqual(undefined)

    if (!error) {
      expect(result).toHaveLength(2)
      expect(result[0].filename).toBe("file1.zip")
      expect(result[0].content).toEqual(Buffer.from("conteúdo do arquivo 1"))
      expect(result[1].filename).toBe("file2.zip")
      expect(result[1].content).toEqual(Buffer.from("conteúdo do arquivo 2"))
    }
  })

  it("should filter out attachments that fail to download", async () => {
    const attachmentsToProcess = [
      Attachment.create({
        title: "file-ok.zip",
        url: "http://example.com/file-ok.zip",
      }),
      Attachment.create({
        title: "file-bad.zip",
        url: "http://example.com/file-bad.zip",
      }),
    ]

    const mockDownloader = new MockDownloader(async (url: string) => {
      if (url === "http://example.com/file-ok.zip") {
        return { buffer: Buffer.from("conteúdo do arquivo ok") }
      }
      throw new Error("Download failed")
    })

    const [error, result] = await createEmailAttachmentsFromUrls(
      attachmentsToProcess,
      {
        downloader: mockDownloader,
      },
    )

    expect(error).toEqual(undefined)

    if (!error) {
      expect(result).toHaveLength(1)
      expect(result[0].filename).toBe("file-ok.zip")
    }
  })
})
