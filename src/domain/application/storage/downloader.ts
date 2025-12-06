import { DomainErrorData } from "@/core/domain-error"

export abstract class Downloader {
  abstract download(
    url: string,
  ): Promise<
    | [undefined, { buffer: Buffer }, undefined]
    | [DomainErrorData, undefined, undefined]
  >
}
