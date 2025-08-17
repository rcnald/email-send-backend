import { Client } from "@/domain/enterprise/entities/client"

export class ClientPresenter {
  static toHTTP(client: Client) {
    return {
      id: client.id,
      name: client.name,
      CNPJ: client.CNPJ,
      accountant: {
        name: client.accountant.name,
        email: client.accountant.email,
      },
    }
  }
}
