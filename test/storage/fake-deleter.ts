import { bad, nice } from "@/core/error"
import { Deleter } from "@/domain/application/storage/deleter"

export class FakeDeleter extends Deleter {
  async delete(params: { url: string }): Promise<
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
  > {
    if (params.url === "non-existent-on-server-url") {
      return bad({
        code: "ATTACHMENT_NOT_FOUND_ON_SERVER",
        message: "Attachment not found on server",
      })
    }

    if (params.url === "fail-delete-url") {
      return bad({
        code: "FAILED_TO_DELETE",
        message: "Failed to delete file",
      })
    }

    return nice()
  }
}
