import { DomainError, DomainErrorData } from "@/core/domain-error"
import { bad, nice } from "@/core/error"
import { Deleter } from "@/domain/application/storage/deleter"

export class FakeDeleter extends Deleter {
  async delete(params: {
    url: string
  }): Promise<
    [undefined, void, undefined] | [DomainErrorData, undefined, undefined]
  > {
    if (params.url === "non-existent-on-server-url") {
      return bad(DomainError.NotFound("Attachment not found on server"))
    }

    if (params.url === "fail-delete-url") {
      return bad(DomainError.ExternalServiceFailed("Failed to delete file"))
    }

    return nice()
  }
}
