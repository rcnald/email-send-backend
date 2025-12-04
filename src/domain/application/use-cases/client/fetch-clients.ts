import { nice } from "@/core/error"

import { ClientRepository } from "../../repositories/client-repository"

export interface FetchClientsUseCaseRequest {
  userId: string
}

export class FetchClientsUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute({ userId }: FetchClientsUseCaseRequest) {
    const clients =
      await this.clientRepository.findManyWithStatusByUserId(userId)

    return nice({ clients })
  }
}
