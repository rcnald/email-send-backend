import type { Client } from "@/domain/enterprise/entities/client";
import type { ClientWithStatus } from "@/domain/enterprise/entities/value-object/client-with-status";

export abstract class ClientRepository {
  abstract create(client: Client): Promise<void>;
  abstract find(id: string): Promise<Client | null>;
  abstract findMany(): Promise<Client[]>;
  abstract findManyWithStatus(): Promise<ClientWithStatus[]>;
  abstract findManyWithStatusByHelperId(
    helperId: string
  ): Promise<ClientWithStatus[]>;
  abstract findByCNPJ(CNPJ: string): Promise<Client | null>;
}
