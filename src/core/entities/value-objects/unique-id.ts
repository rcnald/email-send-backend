import { randomUUID } from "node:crypto"

import { ValueObject } from "../value-object"

export interface UniqueIdProps {
  value: string
}

export class UniqueId extends ValueObject<UniqueIdProps> {
  constructor(value?: string) {
    super({ value: value ?? randomUUID() })
  }

  get value() {
    return this.props.value
  }
}
