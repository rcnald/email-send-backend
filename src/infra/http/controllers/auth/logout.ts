import type { Request, Response } from "express";

import type { LogoutUseCase } from "@/domain/application/use-cases/auth/logout";
import { type Env, getEnv } from "@/infra/env";
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler";
import { ensureUserId } from "@/infra/http/handlers/http-validation";

export class LogoutController {
  constructor(
    private readonly logoutUseCase: LogoutUseCase,
    private readonly env: Env = getEnv()
  ) {}

  handle(request: Request, response: Response): Response {
    const userId = ensureUserId(response, request.userId);

    if (!userId) {
      return response;
    }

    const { refreshToken } = request.cookies ?? {};

    if (!refreshToken) {
      return response.status(401).json({
        code: "UNAUTHORIZED",
        message: "Refresh token not provided",
        data: {},
      });
    }

    const [error] = this.logoutUseCase.execute({
      userId,
      refreshToken,
    });

    if (error) {
      return HttpErrorHandler.handle(response, error);
    }

    const commonCookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: this.env.ENVIRONMENT === "production" ? "strict" : "none",
      path: "/",
    } as const;

    response.clearCookie("accessToken", commonCookieOptions);
    response.clearCookie("refreshToken", commonCookieOptions);

    return response.status(200).json();
  }
}
