import { randomUUID } from "crypto"

import { Optional } from "@/core/types/optional"

export interface HelperProps {
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
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

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(
    {
      name,
      email,
      password,
      createdAt,
      updatedAt,
    }: Optional<HelperProps, "createdAt" | "updatedAt">,
    id?: string,
  ) {
    const helper = new Helper(
      {
        name,
        email,
        password,
        createdAt: createdAt ?? new Date(),
        updatedAt: updatedAt ?? new Date(),
      },
      id,
    )

    return helper
  }

  static validateEmail(email: string) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    return emailRegex.test(email)
  }
}
