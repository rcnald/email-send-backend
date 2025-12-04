import { ClientRepository } from "@/domain/application/repositories/client-repository"
import { Client } from "@/domain/enterprise/entities/client"
import { Mail } from "@/domain/enterprise/entities/mail"
import { ClientWithStatus } from "@/domain/enterprise/entities/value-object/client-with-status"

export class InMemoryClientRepository implements ClientRepository {
  public clients: Client[] = []
  public mails: Mail[] = []

  async find(id: string): Promise<Client | null> {
    return this.clients.find((client) => client.id.value === id) || null
  }

  async create(client: Client): Promise<void> {
    this.clients.push(client)
  }

  async findMany(): Promise<Client[]> {
    return this.clients
  }

  async findManyWithStatus(): Promise<ClientWithStatus[]> {
    return this.clients.map((client) => {
      const mail = this.mails.find((mail) => {
        const isCurrentMonth = new Date().getMonth() === mail.sentAt?.getMonth()

        return mail.clientId.equals(client.id) && isCurrentMonth
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

  async findManyWithStatusByHelperId(
    helperId: string,
  ): Promise<ClientWithStatus[]> {
    return this.clients.map((client) => {
      const mail = this.mails.find((mail) => {
        const isCurrentMonth = new Date().getMonth() === mail.sentAt?.getMonth()

        return (
          mail.clientId.equals(client.id) &&
          isCurrentMonth &&
          client.helperId.value === helperId
        )
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

  async findByCNPJ(CNPJ: string): Promise<Client | null> {
    const client = this.clients.find((client) => client.CNPJ === CNPJ)

    if (!client) {
      return null
    }

    return client
  }
}
