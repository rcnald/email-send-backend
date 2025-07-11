import { ClientRepository } from "@/domain/application/repositories/client-repository"
import { Client } from "@/domain/enterprise/entities/client"

export class InMemoryClientRepository implements ClientRepository {
  private clients: Client[] = []

  async find(id: string): Promise<Client | null> {
    return this.clients.find((client) => client.id === id) || null
  }

  async create(client: Client) {
    this.clients.push(client)
  }
}
