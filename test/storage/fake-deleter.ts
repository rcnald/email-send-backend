import { DomainError, type DomainErrorData } from "@/core/domain-error";
import { bad, nice } from "@/core/error";
import { Deleter } from "@/domain/application/storage/deleter";

export class FakeDeleter extends Deleter {
  async delete(params: {
    url: string;
  }): Promise<
    [undefined, undefined, undefined] | [DomainErrorData, undefined, undefined]
  > {
    await new Promise((resolve) => setTimeout(resolve, 10));

    if (params.url === "non-existent-on-server-url") {
      return bad(DomainError.NotFound("Anexo nao encontrado no servidor"));
    }

    if (params.url === "fail-delete-url") {
      return bad(DomainError.ExternalServiceFailed("Falha ao excluir arquivo"));
    }

    return nice();
  }
}
