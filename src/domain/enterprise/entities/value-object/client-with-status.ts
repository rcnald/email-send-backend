import { ValueObject } from "@/core/entities/value-object"
import { UniqueId } from "@/core/entities/value-objects/unique-id"

import { Email } from "./email"

export interface ClientWithStatusProps {
  clientId: UniqueId
  name: string
  CNPJ: string
  accountant: {
    name: string
    email: Email
  }
  status: "sent" | "not_sent"
}

export class ClientWithStatus extends ValueObject<ClientWithStatusProps> {
  get name() {
    return this.props.name
  }

  get CNPJ() {
    return this.props.CNPJ
  }

  get accountant() {
    return this.props.accountant
  }

  get status() {
    return this.props.status
  }

  get clientId() {
    return this.props.clientId
  }

  static create(props: ClientWithStatusProps) {
    return new ClientWithStatus(props)
  }
}
