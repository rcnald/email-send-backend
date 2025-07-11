import { MailRepository } from "@/domain/application/repositories/mail-repository"
import { Mail } from "@/domain/enterprise/entities/mail"

export class InMemoryMailRepository implements MailRepository {
  private mails: Mail[] = []

  async create(mail: Mail) {
    this.mails.push(mail)
  }

  async update(mail: Mail): Promise<void> {
    const index = this.mails.findIndex(
      (existingMail) => existingMail.id === mail.id,
    )
    if (index !== -1) {
      this.mails[index] = mail
    }
  }

  async find(id: string): Promise<Mail | null> {
    return this.mails.find((mail) => mail.id === id) || null
  }
}
