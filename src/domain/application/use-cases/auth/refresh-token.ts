import { bad, nice } from "@/core/error"

import { Encrypter } from "../../cryptography/encrypter"
import { HelperRepository } from "../../repositories/helper-repository"

export interface RefreshTokenUseCaseRequest {
  refreshToken: string
}

export class RefreshTokenUseCase {
  constructor(
    private helperRepository: HelperRepository,
    private encrypter: Encrypter,
  ) {}

  async execute({ refreshToken }: RefreshTokenUseCaseRequest) {
    const payload = await this.encrypter.decrypt(refreshToken)

    if (!payload) {
      return bad({
        code: "INVALID_TOKEN",
        message: "Invalid or expired refresh token",
        data: {},
      })
    }

    if (payload.type !== "refresh") {
      return bad({
        code: "INVALID_TOKEN_TYPE",
        message: "Token must be a refresh token",
        data: {},
      })
    }

    const helper = await this.helperRepository.findById(payload.sub)

    if (!helper) {
      return bad({
        code: "HELPER_NOT_FOUND",
        message: "Helper not found",
        data: {},
      })
    }

    const accessToken = await this.encrypter.encrypt({
      sub: helper.id.toString(),
      type: "access",
      expiresIn: "15m",
    })

    const newRefreshToken = await this.encrypter.encrypt({
      sub: helper.id.toString(),
      type: "refresh",
      expiresIn: "7d",
    })

    return nice({
      accessToken,
      refreshToken: newRefreshToken,
    })
  }
}
