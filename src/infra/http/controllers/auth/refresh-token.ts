import type { Request, Response } from "express";

import type { RefreshTokenUseCase } from "@/domain/application/use-cases/auth/refresh-token";
import { type Env, getEnv } from "@/infra/env";
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler";

export class RefreshTokenController {
  constructor(
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly env: Env = getEnv()
  ) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { refreshToken } = request.cookies ?? {};

    if (!refreshToken) {
      return response.status(401).json({
        message: "Token de atualizacao nao fornecido",
        data: {},
      });
    }

    const [error, result] = await this.refreshTokenUseCase.execute({
      refreshToken,
    });

    if (error) {
      return HttpErrorHandler.handle(response, error);
    }

    const { accessToken } = result;

    response.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: this.env.ENVIRONMENT === "production" ? "strict" : "none",
      maxAge: this.env.JWT_ACCESS_TOKEN_MAX_AGE,
    });

    return response.status(200).json();
  }
}
