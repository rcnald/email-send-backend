import { Request, Response } from "express"

import { RefreshTokenUseCase } from "@/domain/application/use-cases/auth/refresh-token"
import { Env, getEnv } from "@/infra/env"
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler"

export class RefreshTokenController {
  constructor(
    private refreshTokenUseCase: RefreshTokenUseCase,
    private env: Env = getEnv(),
  ) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { refreshToken } = request.cookies ?? {}

    if (!refreshToken) {
      return response.status(401).json({
        message: "Refresh token not provided",
        data: {},
      })
    }

    const [error, result] = await this.refreshTokenUseCase.execute({
      refreshToken,
    })

    if (error) {
      return HttpErrorHandler.handle(response, error)
    }

    const { accessToken, refreshToken: newRefreshToken } = result

    response.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: this.env.ENVIRONMENT === "production",
      sameSite: "strict",
      maxAge: this.env.JWT_ACCESS_TOKEN_MAX_AGE,
    })

    response.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: this.env.ENVIRONMENT === "production",
      sameSite: "strict",
      maxAge: this.env.JWT_REFRESH_TOKEN_MAX_AGE,
    })

    return response.status(200).json()
  }
}
