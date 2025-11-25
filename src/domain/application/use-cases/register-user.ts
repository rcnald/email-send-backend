import { bad, nice } from "@/core/error"
import { Helper } from "@/domain/enterprise/entities/helper"
import { Email } from "@/domain/enterprise/entities/value-object/email"

import { HashGenerator } from "../cryptography/hash-generator"
import { HelperRepository } from "../repositories/helper-repository"

export interface RegisterUserRequest {
  email: string
  name: string
  password: string
}

export class RegisterUserUseCase {
  constructor(
    private helperRepository: HelperRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({ email, name, password }: RegisterUserRequest) {
    const [emailError, helperEmail] = Email.create(email)

    if (emailError) {
      return bad(emailError)
    }

    const existingHelper = await this.helperRepository.findByEmail(
      helperEmail.value,
    )

    if (existingHelper) {
      return bad({
        code: "HELPER_ALREADY_EXISTS",
        message: "Helper with this email already exists",
        data: { email: helperEmail.value },
      })
    }

    const hashedPassword = await this.hashGenerator.hash(password)

    const helper = Helper.create({
      email: helperEmail,
      name,
      password: hashedPassword,
    })

    await this.helperRepository.create(helper)

    return nice({
      helperId: helper.id,
    })
  }
}
