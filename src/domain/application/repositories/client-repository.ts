import { Client } from "@/domain/enterprise/entities/client"
import { ClientWithStatus } from "@/domain/enterprise/entities/value-object/client-with-status"

export abstract class ClientRepository {
  abstract create(client: Client): Promise<void>
  abstract find(id: string): Promise<Client | null>
  abstract findMany(): Promise<Client[]>
  abstract findManyWithStatus(): Promise<ClientWithStatus[]>
}
