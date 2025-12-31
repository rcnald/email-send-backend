import { DomainError } from "@/core/domain-error"
import { bad, nice } from "@/core/error"
import { Email } from "@/domain/enterprise/entities/value-object/email"
import { Env } from "@/infra/env"

import { Encrypter } from "../../cryptography/encrypter"
import { HashComparator } from "../../cryptography/hash-comparator"
import { HelperRepository } from "../../repositories/helper-repository"

export interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

export class AuthenticateUseCase {
  constructor(
    private helperRepository: HelperRepository,
    private hashComparator: HashComparator,
    private encrypter: Encrypter,
    private env: Env,
  ) {}

  async execute({ email, password }: AuthenticateUseCaseRequest) {
    const [emailError, emailVO] = Email.create(email)

    if (emailError) {
      return bad(emailError)
    }

    const helper = await this.helperRepository.findByEmail(emailVO.value)

    if (!helper) {
      return bad(DomainError.Unauthorized("Email ou senha inválidos"))
    }

    const isPasswordValid = await this.hashComparator.compare(
      password,
      helper.password,
    )

    if (!isPasswordValid) {
      return bad(DomainError.Unauthorized("Email ou senha inválidos"))
    }

    const accessToken = this.encrypter.encrypt({
      sub: helper.id.value,
      type: "access",
      expiresIn: this.env.JWT_ACCESS_TOKEN_EXPIRATION,
    })

    const refreshToken = this.encrypter.encrypt({
      sub: helper.id.value,
      type: "refresh",
      expiresIn: this.env.JWT_REFRESH_TOKEN_EXPIRATION,
    })

    return nice({ accessToken, refreshToken })
  }
}
