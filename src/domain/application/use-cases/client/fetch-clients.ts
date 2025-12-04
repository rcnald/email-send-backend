import { bad, nice } from "@/core/error"

import { ClientRepository } from "../../repositories/client-repository"
import { HelperRepository } from "../../repositories/helper-repository"

export interface FetchClientsUseCaseRequest {
  helperId: string
}

export class FetchClientsUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly helperRepository: HelperRepository,
  ) {}

  async execute({ helperId }: FetchClientsUseCaseRequest) {
    const helper = await this.helperRepository.findById(helperId)

    if (!helper) {
      return bad({
        code: "HELPER_NOT_FOUND",
        message: "Helper not found",
        data: { helperId },
      })
    }

    const clients =
      await this.clientRepository.findManyWithStatusByHelperId(helperId)

    return nice({ clients })
  }
}
