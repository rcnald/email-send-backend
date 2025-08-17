import { nice } from "@/core/error"

import { ClientRepository } from "../repositories/client-repository"

export class FetchClientsUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute() {
    const clients = await this.clientRepository.fetchAll()

    return nice({ clients })
  }
}
