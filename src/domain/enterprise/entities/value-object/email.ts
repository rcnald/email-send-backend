import { DomainError } from "@/core/domain-error";
import { ValueObject } from "@/core/entities/value-object";
import { bad, nice } from "@/core/error";

export interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  get value() {
    return this.props.value;
  }

  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private static isValid(email: string): boolean {
    return Email.EMAIL_REGEX.test(email);
  }

  private static normalize(email: string): string {
    return email.toLowerCase().trim();
  }

  static create(email: string) {
    const normalized = Email.normalize(email);

    if (!Email.isValid(normalized)) {
      return bad(
        DomainError.InvalidResource("O formato do email é inválido", {
          email: normalized,
        })
      );
    }

    const emailVO = new Email({ value: normalized });

    return nice(emailVO);
  }

  /*
   * Use with caution: skips validation
   */
  static unsafeCreate(email: string) {
    const normalized = Email.normalize(email);
    return new Email({ value: normalized });
  }

  static fromPersistence(email: string): Email {
    return new Email({ value: email });
  }
}
