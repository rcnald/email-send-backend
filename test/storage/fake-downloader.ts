import { bad, nice } from "@/core/error"
import { Downloader } from "@/domain/application/storage/downloader"

export class FakeDownloader implements Downloader {
  async download(url: string): Promise<
    | [undefined, { buffer: Buffer }]
    | [
        {
          code: "FAILED_TO_DOWNLOAD"
          message: "Failed to download file"
          file: string
        },
        undefined,
      ]
  > {
    if (url === "http://fake-storage/invalid-file.zip") {
      return bad({
        code: "FAILED_TO_DOWNLOAD",
        message: "Failed to download file",
        file: url,
      })
    }

    return nice({ buffer: Buffer.from("file content ok") })
  }
}
