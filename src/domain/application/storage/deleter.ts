import { DomainErrorData } from "@/core/domain-error"

export interface DeleterParams {
  url: string
}

export abstract class Deleter {
  abstract delete(
    params: DeleterParams,
  ): Promise<
    [undefined, void, undefined] | [DomainErrorData, undefined, undefined]
  >
}
