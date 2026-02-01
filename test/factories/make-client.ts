import { faker } from "@faker-js/faker";
import type { PrismaClient } from "@prisma/client";

import { UniqueId } from "@/core/entities/value-objects/unique-id";
import { Client, type ClientProps } from "@/domain/enterprise/entities/client";
import { Email } from "@/domain/enterprise/entities/value-object/email";

export const makeClient = (
  { name, CNPJ, accountant, helperId }: Partial<ClientProps> = {},
  id?: UniqueId
) => {
  const client = Client.create(
    {
      helperId: helperId ?? new UniqueId(),
      name: name ?? faker.company.name(),
      CNPJ: CNPJ ?? faker.string.numeric(14),
      accountant: {
        name: accountant?.name ?? faker.person.firstName(),
        email:
          accountant?.email ??
          Email.unsafeCreate(`${faker.person.firstName()}@email.com`),
      },
    },
    id
  );

  return client;
};

export class ClientFactory {
  constructor(private readonly prisma: PrismaClient) {}

  async makePrismaClient(props: Partial<ClientProps> = {}, id?: UniqueId) {
    const client = makeClient(props, id);

    await this.prisma.client.create({
      data: {
        id: client.id.value,
        name: client.name,
        CNPJ: client.CNPJ,
        helperId: client.helperId.value,
        accountantName: client.accountant.name,
        accountantEmail: client.accountant.email.value,
      },
    });

    return client;
  }
}
