export interface UploadParams {
  fileName: string
  fileType: string
  body: Buffer
}

export abstract class Uploader {
  abstract upload(
    params: UploadParams,
  ): Promise<
    | [undefined, { url: string }, undefined]
    | [
        { code: "FAILED_TO_UPLOAD"; message: "Failed to upload file" },
        undefined,
        undefined,
      ]
  >
}
