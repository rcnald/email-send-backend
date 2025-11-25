import { Entity } from "@/core/entities/entity"
import { UniqueId } from "@/core/entities/value-objects/unique-id"
import { Optional } from "@/core/types/optional"

import { Email } from "./value-object/email"

export interface HelperProps {
  name: string
  email: Email
  password: string
  createdAt: Date
  updatedAt: Date
}

export class Helper extends Entity<HelperProps> {
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
    id?: UniqueId,
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
}
