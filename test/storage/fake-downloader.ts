import { DomainError, type DomainErrorData } from "@/core/domain-error";
import { bad, nice } from "@/core/error";
import type { Downloader } from "@/domain/application/storage/downloader";

export class FakeDownloader implements Downloader {
  async download(
    url: string
  ): Promise<
    | [undefined, { buffer: Buffer }, undefined]
    | [DomainErrorData, undefined, undefined]
  > {
    await new Promise((resolve) => setTimeout(resolve, 10));

    if (
      url === "http://fake-storage/invalid-file.zip" ||
      url.includes(
        `invalid-sa-do-mes-de-${new Intl.DateTimeFormat("pt-BR", {
          month: "long",
        }).format(new Date().setMonth(new Date().getMonth() - 1))}-1`
      )
    ) {
      return bad(
        DomainError.ExternalServiceFailed("Falha ao baixar arquivo", {
          file: url,
        })
      );
    }

    return nice({ buffer: Buffer.from("file content ok") });
  }
}
