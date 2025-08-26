import { ValueObject } from "@/core/entities/value-object"

export interface ClientWithStatusProps {
  clientId: string
  name: string
  CNPJ: string
  accountant: {
    name: string
    email: string
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

  static create(props: ClientWithStatusProps) {
    return new ClientWithStatus(props)
  }
}
