import { Mail } from "@/domain/enterprise/entities/mail"

export abstract class MailRepository {
  abstract create(mail: Mail): Promise<void>
  abstract update(mail: Mail): Promise<void>
}
