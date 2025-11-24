import { ValueObject } from "@/core/entities/value-object"

export class Email extends ValueObject<string> {
  private readonly value: string

  private constructor(email: string) {
    super()
    this.value = email
  }

  static create(email: string): [Error | undefined, Email | undefined] {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      return [new Error("Invalid email format"), undefined]
    }

    return [undefined, new Email(email)]
  }

  getValue(): string {
    return this.value
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }
}
