import { Entity } from "@/core/entities/entity"

import { Email } from "./value-object/email"

export interface ClientProps {
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

  static create({ name, CNPJ, accountant }: ClientProps, id?: string) {
    const client = new Client({ name, CNPJ, accountant }, id)

    return client
  }
}
