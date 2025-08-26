import { ClientRepository } from "@/domain/application/repositories/client-repository"
import { Client } from "@/domain/enterprise/entities/client"
import { Mail } from "@/domain/enterprise/entities/mail"
import { ClientWithStatus } from "@/domain/enterprise/entities/value-object/client-with-status"

export class InMemoryClientRepository implements ClientRepository {
  private clients: Client[] = []
  public mails: Mail[] = []

  async find(id: string): Promise<Client | null> {
    return this.clients.find((client) => client.id === id) || null
  }

  async create(client: Client) {
    this.clients.push(client)
  }

  async findMany(): Promise<Client[]> {
    return this.clients
  }

  async findManyWithStatus(): Promise<ClientWithStatus[]> {
    return this.clients.map((client) => {
      const mail = this.mails.find((mail) => {
        const isCurrentMonth = new Date().getMonth() === mail.sentAt?.getMonth()

        return mail.clientId === client.id && isCurrentMonth
      })

      return ClientWithStatus.create({
        clientId: client.id,
        name: client.name,
        CNPJ: client.CNPJ,
        accountant: client.accountant,
        status: mail ? "sent" : "not_sent",
      })
    })
  }
}
