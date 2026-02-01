import { DomainError } from "@/core/domain-error";
import { UniqueId } from "@/core/entities/value-objects/unique-id";
import { bad, nice } from "@/core/error";
import { Client } from "@/domain/enterprise/entities/client";
import { Email } from "@/domain/enterprise/entities/value-object/email";

import type { ClientRepository } from "../../repositories/client-repository";
import type { HelperRepository } from "../../repositories/helper-repository";

export interface CreateClientRequest {
  helperId: string;
  name: string;
  CNPJ: string;
  accountant: {
    name: string;
    email: string;
  };
}

export class CreateClientUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly helperRepository: HelperRepository
  ) {}

  async execute({ name, CNPJ, accountant, helperId }: CreateClientRequest) {
    const clientExists = await this.clientRepository.findByCNPJ(CNPJ);

    if (clientExists) {
      return bad(DomainError.AlreadyExists("Client already exists", { CNPJ }));
    }

    const helperExists = await this.helperRepository.findById(helperId);

    if (!helperExists) {
      return bad(
        DomainError.NotFound("Helper not found", {
          helperId,
        })
      );
    }

    const [accountantEmailError, accountantEmail] = Email.create(
      accountant.email
    );

    if (accountantEmailError) {
      return bad(
        DomainError.InvalidResource("Invalid email provided", {
          email: accountant.email,
        })
      );
    }

    const client = Client.create({
      helperId: new UniqueId(helperId),
      name,
      CNPJ,
      accountant: { ...accountant, email: accountantEmail },
    });

    await this.clientRepository.create(client);

    return nice({
      clientId: client.id.value,
    });
  }
}
