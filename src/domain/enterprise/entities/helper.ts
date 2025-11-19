import { randomUUID } from "crypto"

export interface HelperProps {
  name: string
  email: string
  password: string
}

export class Helper {
  private _id: string

  constructor(
    private props: HelperProps,
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

  get email() {
    return this.props.email
  }

  get password() {
    return this.props.password
  }

  static create({ name, email, password }: HelperProps, id?: string) {
    const helper = new Helper({ name, email, password }, id)

    return helper
  }

  static validateEmail(email: string) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    return emailRegex.test(email)
  }
}
