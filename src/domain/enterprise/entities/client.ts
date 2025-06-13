import { randomUUID } from "crypto"

export interface ClientProps {
  name: string
  CNPJ: string
  accountant: {
    name: string
    email: string
  }
}

export class Client {
  private _id: string

  constructor(
    private props: ClientProps,
    id?: string,
  ) {
    this._id = id ?? randomUUID()
  }

  get id() {
    return this._id
  }

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
