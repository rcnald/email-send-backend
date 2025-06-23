import { MailRepository } from "@/domain/application/repositories/mail-repository"
import { Mail } from "@/domain/enterprise/entities/mail"

export class InMemoryMailRepository implements MailRepository {
  private mails: Mail[] = []

  async create(mail: Mail) {
    this.mails.push(mail)
  }

  async find(id: string): Promise<Mail | null> {
    return this.mails.find((mail) => mail.id === id) || null
  }
}
