import { bad, nice } from "@/core/error"
import { Email } from "@/domain/enterprise/entities/value-object/email"

import { Encrypter } from "../cryptography/encrypter"
import { HashComparator } from "../cryptography/hash-comparator"
import { HelperRepository } from "../repositories/helper-repository"

export interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

export class AuthenticateUseCase {
  constructor(
    private helperRepository: HelperRepository,
    private hashComparator: HashComparator,
    private encrypter: Encrypter,
  ) {}

  async execute({ email, password }: AuthenticateUseCaseRequest) {
    const [emailError, emailVO] = Email.create(email)

    if (emailError) {
      return bad({
        code: "INVALID_EMAIL",
        message: "The email provided is invalid",
        data: { email },
      })
    }

    const helper = await this.helperRepository.findByEmail(emailVO.value)

    if (!helper) {
      return bad({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
        data: {},
      })
    }

    const isPasswordValid = await this.hashComparator.compare(
      password,
      helper.password,
    )

    if (!isPasswordValid) {
      return bad({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
        data: {},
      })
    }

    const accessToken = await this.encrypter.encrypt({
      sub: helper.id.toString(),
      expiresIn: "15m",
    })

    const refreshToken = await this.encrypter.encrypt({
      sub: helper.id.toString(),
      expiresIn: "7d",
    })

    return nice({ accessToken, refreshToken })
  }
}
