import { UniqueId } from "@/core/entities/value-objects/unique-id"
import { bad, nice } from "@/core/error"
import { Client } from "@/domain/enterprise/entities/client"
import { Email } from "@/domain/enterprise/entities/value-object/email"

import { ClientRepository } from "../../repositories/client-repository"
import { HelperRepository } from "../../repositories/helper-repository"

export interface CreateClientRequest {
  userId: string
  name: string
  CNPJ: string
  accountant: {
    name: string
    email: string
  }
}

export class CreateClientUseCase {
  constructor(
    private clientRepository: ClientRepository,
    private helperRepository: HelperRepository,
  ) {}

  async execute({ name, CNPJ, accountant, userId }: CreateClientRequest) {
    const clientExists = await this.clientRepository.findByCNPJ(CNPJ)

    if (clientExists) {
      return bad({
        code: "CLIENT_ALREADY_EXISTS",
        message: "Client with this CNPJ already exists",
        data: { CNPJ },
      })
    }

    const helperExists = await this.helperRepository.findById(userId)

    if (!helperExists) {
      return bad({
        code: "HELPER_NOT_FOUND",
        message: "Helper not found",
        data: { userId },
      })
    }

    const [accountantEmailError, accountantEmail] = Email.create(
      accountant.email,
    )

    if (accountantEmailError) {
      return bad(accountantEmailError)
    }

    const client = Client.create({
      helperId: new UniqueId(userId),
      name,
      CNPJ,
      accountant: { ...accountant, email: accountantEmail },
    })

    await this.clientRepository.create(client)

    return nice({
      clientId: client.id.value,
    })
  }
}
