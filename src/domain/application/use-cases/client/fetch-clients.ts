import { nice } from "@/core/error"

import { ClientRepository } from "../../repositories/client-repository"

export interface FetchClientsUseCaseRequest {
  helperId: string
}

export class FetchClientsUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute({ helperId }: FetchClientsUseCaseRequest) {
    const clients =
      await this.clientRepository.findManyWithStatusByHelperId(helperId)

    return nice({ clients })
  }
}
