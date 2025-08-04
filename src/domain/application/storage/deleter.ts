export interface DeleterParams {
  attachmentId: string
}

export abstract class Deleter {
  abstract delete(params: DeleterParams): Promise<
    | [undefined, void, undefined]
    | [
        { code: "FAILED_TO_DELETE"; message: "Failed to delete file" },
        undefined,
        undefined,
      ]
    | [
        {
          code: "ATTACHMENT_NOT_FOUND_ON_SERVER"
          message: "Attachment not found on server"
        },
        undefined,
        undefined,
      ]
  >
}
