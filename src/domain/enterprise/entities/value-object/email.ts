import { ValueObject } from "@/core/entities/value-object"
import { bad, nice } from "@/core/error"

export interface EmailProps {
  value: string
}

export class Email extends ValueObject<EmailProps> {
  get value() {
    return this.props.value
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private static normalize(email: string): string {
    return email.toLowerCase().trim()
  }

  static create(email: string) {
    const normalized = this.normalize(email)

    if (!this.isValid(normalized)) {
      return bad({
        code: "INVALID_EMAIL",
        message: `Invalid email format`,
        data: { email },
      })
    }

    const emailVO = new Email({ value: normalized })

    return nice(emailVO)
  }

  /*
   * Use with caution: skips validation
   */
  static unsafeCreate(email: string) {
    const normalized = this.normalize(email)
    return new Email({ value: normalized })
  }
}
