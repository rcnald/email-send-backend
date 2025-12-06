import { DomainError, DomainErrorData } from "@/core/domain-error"
import { bad, nice } from "@/core/error"
import { Uploader } from "@/domain/application/storage/uploader"

export class FakeUploader implements Uploader {
  async upload(params: {
    fileName: string
    fileType: string
    body: Buffer
  }): Promise<
    | [undefined, { url: string }, undefined]
    | [DomainErrorData, undefined, undefined]
  > {
    const { fileName } = params
    if (fileName === "invalid.zip") {
      return bad(DomainError.ExternalServiceFailed("Failed to upload file"))
    }
    return nice({ url: `http://fakeurl.com/${fileName}` })
  }
}
