import { bad, nice } from "@/core/error"
import { Client } from "@/domain/enterprise/entities/client"

import { ClientRepository } from "../repositories/client-repository"

export interface CreateClientRequest {
  name: string
  CNPJ: string
  accountant: {
    name: string
    email: string
  }
}

export class CreateClientUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute({ name, CNPJ, accountant }: CreateClientRequest) {
    const clientExists = await this.clientRepository.findByCNPJ(CNPJ)

    if (clientExists) {
      return bad({
        code: "CLIENT_ALREADY_EXISTS",
        message: "Client with this CNPJ already exists",
        data: { CNPJ },
      })
    }

    const isEmailValid = Client.validateEmail(accountant.email)

    if (!isEmailValid) {
      return bad({
        code: "INVALID_EMAIL",
        message: "The accountant email provided is invalid",
        data: { email: accountant.email },
      })
    }

    const client = Client.create({ name, CNPJ, accountant })

    await this.clientRepository.create(client)

    return nice({
      clientId: client.id,
    })
  }
}
