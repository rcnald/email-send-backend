import { Client } from "@/domain/enterprise/entities/client"

export abstract class ClientRepository {
  abstract create(client: Client): Promise<void>
  abstract find(id: string): Promise<Client | null>
  abstract fetchAll(): Promise<Client[]>
}
