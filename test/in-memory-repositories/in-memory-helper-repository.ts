import { HelperRepository } from "@/domain/application/repositories/helper-repository"
import { Helper } from "@/domain/enterprise/entities/helper"

export class InMemoryHelperRepository implements HelperRepository {
  public helpers: Helper[] = []

  async create(helper: Helper): Promise<void> {
    this.helpers.push(helper)
  }

  async findById(id: string): Promise<Helper | null> {
    const helper = this.helpers.find((helper) => helper.id.value === id)

    if (!helper) {
      return null
    }

    return helper
  }

  async findByEmail(email: string): Promise<Helper | null> {
    const helper = this.helpers.find((helper) => helper.email.value === email)

    if (!helper) {
      return null
    }

    return helper
  }
}
