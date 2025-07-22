import { bad, nice } from "@/core/error"
import { Uploader } from "@/domain/application/storage/uploader"

export class FakeUploader implements Uploader {
  async upload(params: {
    fileName: string
    fileType: string
    body: Buffer
  }): Promise<
    | [undefined, { url: string }, undefined]
    | [
        { code: "FAILED_TO_UPLOAD"; message: "Failed to upload file" },
        undefined,
        undefined,
      ]
  > {
    const { fileName } = params
    if (fileName === "invalid.zip") {
      return bad({ code: "FAILED_TO_UPLOAD", message: "Failed to upload file" })
    }
    return nice({ url: `http://fakeurl.com/${fileName}` })
  }
}
