import { vi } from "vitest"

import { Attachment } from "../entities/attachment"
import { createEmailAttachmentsFromUrls } from "./create-email-attachment-from-url"

vi.stubGlobal("fetch", vi.fn())

function createMockFetchResponse(data: string, ok: boolean): Response {
  return {
    ok,
    status: ok ? 200 : 400,
    statusText: ok ? "OK" : "Bad Request",
    headers: new Headers(),
    redirected: false,
    type: "basic",
    url: "",
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: vi
      .fn()
      .mockResolvedValue(new TextEncoder().encode(data).buffer),
    blob: vi.fn(),
    formData: vi.fn(),
    json: vi.fn(),
    text: vi.fn(),
  }
}

describe("createEmailAttachmentsFromUrls", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should create email attachments from valid urls", async () => {
    const attachmentsToFetch = [
      Attachment.create({
        title: "file1",
        url: "http://example.com/file1.zip",
      }),
      Attachment.create({
        title: "file2",
        url: "http://example.com/file2.zip",
      }),
    ]

    vi.mocked(fetch)
      .mockResolvedValueOnce(
        createMockFetchResponse("conteúdo do arquivo 1", true),
      )
      .mockResolvedValueOnce(
        createMockFetchResponse("conteúdo do arquivo 2", true),
      )

    const [error, result] =
      await createEmailAttachmentsFromUrls(attachmentsToFetch)

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenCalledWith("http://example.com/file1.zip")
    expect(fetch).toHaveBeenCalledWith("http://example.com/file2.zip")

    expect(error).toEqual(undefined)

    if (!error) {
      expect(result).toHaveLength(2)
      expect(result[0].filename).toBe("file1")
      expect(result[0].content).toEqual(Buffer.from("conteúdo do arquivo 1"))
      expect(result[1].filename).toBe("file2")
      expect(result[1].content).toEqual(Buffer.from("conteúdo do arquivo 2"))
    }
  })

  it("should filter out attachments that fail to download", async () => {
    const attachmentsToProcess = [
      Attachment.create({
        title: "file-ok",
        url: "http://example.com/file-ok.zip",
      }),
      Attachment.create({
        title: "file-bad",
        url: "http://example.com/file-bad.zip",
      }),
    ]

    vi.mocked(fetch)
      .mockResolvedValueOnce(
        createMockFetchResponse("conteúdo do arquivo ok", true),
      )
      .mockResolvedValueOnce(createMockFetchResponse("", false))

    const [error, result] =
      await createEmailAttachmentsFromUrls(attachmentsToProcess)

    expect(error).toEqual(undefined)
    expect(fetch).toHaveBeenCalledTimes(2)

    expect(result).toHaveLength(1)
    if (!error) {
      expect(result[0].filename).toBe("file-ok")
    }
  })
})
