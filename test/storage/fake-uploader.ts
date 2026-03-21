import { DomainError, type DomainErrorData } from "@/core/domain-error";
import { bad, nice } from "@/core/error";
import type { Uploader } from "@/domain/application/storage/uploader";

export class FakeUploader implements Uploader {
  async upload(params: {
    fileName: string;
    fileType: string;
    body: Buffer;
  }): Promise<
    | [undefined, { url: string }, undefined]
    | [DomainErrorData, undefined, undefined]
  > {
    await new Promise((resolve) => setTimeout(resolve, 10));

    const { fileName } = params;

    if (fileName === "invalid.zip") {
      return bad(DomainError.ExternalServiceFailed("Falha ao enviar arquivo"));
    }
    return nice({ url: `http://fakeurl.com/${fileName}` });
  }
}
