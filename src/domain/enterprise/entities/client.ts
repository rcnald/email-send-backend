import { Entity } from "@/core/entities/entity"
import { UniqueId } from "@/core/entities/value-objects/unique-id"

import { Email } from "./value-object/email"

export interface ClientProps {
  helperId: UniqueId
  name: string
  CNPJ: string
  accountant: {
    name: string
    email: Email
  }
}

export class Client extends Entity<ClientProps> {
  get name() {
    return this.props.name
  }

  get CNPJ() {
    return this.props.CNPJ
  }

  get accountant() {
    return this.props.accountant
  }

  get helperId() {
    return this.props.helperId
  }

  static create(
    { helperId, name, CNPJ, accountant }: ClientProps,
    id?: UniqueId,
  ) {
    const client = new Client({ helperId, name, CNPJ, accountant }, id)

    return client
  }
}
