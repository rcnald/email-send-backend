import { DomainError } from "@/core/domain-error";
import { bad, nice } from "@/core/error";

import type { ClientRepository } from "../../repositories/client-repository";
import type { HelperRepository } from "../../repositories/helper-repository";

export interface FetchClientsUseCaseRequest {
  helperId: string;
}

export class FetchClientsUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly helperRepository: HelperRepository
  ) {}

  async execute({ helperId }: FetchClientsUseCaseRequest) {
    const helper = await this.helperRepository.findById(helperId);

    if (!helper) {
      return bad(
        DomainError.NotFound("Assistente nao encontrado", {
          helperId,
        })
      );
    }

    const clients =
      await this.clientRepository.findManyWithStatusByHelperId(helperId);

    return nice({ clients });
  }
}
