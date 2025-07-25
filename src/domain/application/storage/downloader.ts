export abstract class Downloader {
  abstract download(url: string): Promise<
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
  >
}
