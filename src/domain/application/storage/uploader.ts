import type { DomainErrorData } from "@/core/domain-error";

export interface UploadParams {
  fileName: string;
  fileType: string;
  body: Buffer;
}

export abstract class Uploader {
  abstract upload(
    params: UploadParams
  ): Promise<
    | [undefined, { url: string }, undefined]
    | [DomainErrorData, undefined, undefined]
  >;
}
