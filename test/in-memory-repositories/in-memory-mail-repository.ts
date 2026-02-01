import type { MailRepository } from "@/domain/application/repositories/mail-repository";
import type { Mail } from "@/domain/enterprise/entities/mail";

export class InMemoryMailRepository implements MailRepository {
  private readonly mails: Mail[] = [];

  async create(mail: Mail) {
    await new Promise((resolve) => setTimeout(resolve, 10));

    this.mails.push(mail);
  }

  async update(mail: Mail): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 10));

    const index = this.mails.findIndex(
      (existingMail) => existingMail.id === mail.id
    );
    if (index !== -1) {
      this.mails[index] = mail;
    }
  }

  async find(id: string): Promise<Mail | null> {
    await new Promise((resolve) => setTimeout(resolve, 10));

    return this.mails.find((mail) => mail.id.value === id) || null;
  }
}
