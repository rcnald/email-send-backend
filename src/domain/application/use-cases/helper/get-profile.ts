import { DomainError } from "@/core/domain-error";
import { bad, nice } from "@/core/error";

import type { HelperRepository } from "../../repositories/helper-repository";

export interface GetProfileUseCaseRequest {
  helperId: string;
}

export class GetProfileUseCase {
  constructor(private readonly helperRepository: HelperRepository) {}

  async execute({ helperId }: GetProfileUseCaseRequest) {
    const helper = await this.helperRepository.findById(helperId);

    if (!helper) {
      return bad(
        DomainError.NotFound("Assistente não encontrado", { helperId })
      );
    }

    return nice(helper);
  }
}
