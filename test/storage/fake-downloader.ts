import { bad, nice } from "@/core/error"
import { Downloader } from "@/domain/application/storage/downloader"

export class FakeDownloader implements Downloader {
  async download(url: string): Promise<
    | [undefined, { buffer: Buffer }, undefined]
    | [
        {
          code: "FAILED_TO_DOWNLOAD"
          message: "Failed to download file"
          file: string
        },
        undefined,
        undefined,
      ]
  > {
    if (
      url === "http://fake-storage/invalid-file.zip" ||
      url.includes(
        `invalid-sa-do-mes-de-${new Intl.DateTimeFormat("pt-BR", {
          month: "long",
        }).format(new Date().setMonth(new Date().getMonth() - 1))}-1`,
      )
    ) {
      return bad({
        code: "FAILED_TO_DOWNLOAD",
        message: "Failed to download file",
        file: url,
      })
    }

    return nice({ buffer: Buffer.from("file content ok") })
  }
}
