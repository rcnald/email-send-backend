import { ClientWithStatus } from "@/domain/enterprise/entities/value-object/client-with-status"

export class ClientWithStatusPresenter {
  static toHTTP(client: ClientWithStatus) {
    return {
      id: client.clientId.value,
      name: client.name,
      CNPJ: client.CNPJ,
      accountant: {
        name: client.accountant.name,
        email: client.accountant.email.value,
      },
      status: client.status,
    }
  }
}
