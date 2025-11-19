import { bad, nice } from "@/core/error"
import { Helper } from "@/domain/enterprise/entities/helper"

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
    const isEmailValid = Helper.validateEmail(email)

    if (!isEmailValid) {
      return bad({
        code: "INVALID_EMAIL",
        message: "The email provided is invalid",
        data: { email },
      })
    }

    const existingHelper = await this.helperRepository.findByEmail(email)

    if (existingHelper) {
      return bad({
        code: "HELPER_ALREADY_EXISTS",
        message: "Helper with this email already exists",
        data: { email },
      })
    }

    const hashedPassword = await this.hashGenerator.generate(password)

    const helper = Helper.create({
      email,
      name,
      password: hashedPassword,
    })

    await this.helperRepository.create(helper)

    return nice({
      helperId: helper.id,
    })
  }
}
