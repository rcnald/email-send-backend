import type { Request, Response } from "express";
import type { AuthenticateUseCase } from "@/domain/application/use-cases/auth/authenticate";
import { type Env, getEnv } from "@/infra/env";
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler";
import { validateRequest } from "@/infra/http/handlers/http-validation";
import { z } from "@/infra/lib/zod";

const authenticateControllerBodySchema = z.object({
  email: z.email("O Endereço de email fornecido é inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export class AuthenticateController {
  constructor(
    private readonly authenticateUseCase: AuthenticateUseCase,
    private readonly env: Env = getEnv()
  ) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const body = validateRequest(
      response,
      authenticateControllerBodySchema,
      request.body
    );

    if (!body) {
      return response;
    }

    const { email, password } = body;

    const [error, result] = await this.authenticateUseCase.execute({
      email,
      password,
    });

    if (error) {
      return HttpErrorHandler.handle(response, error);
    }

    response.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: this.env.ENVIRONMENT === "production",
      sameSite: "strict",
      maxAge: this.env.JWT_ACCESS_TOKEN_MAX_AGE,
    });

    response.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: this.env.ENVIRONMENT === "production",
      sameSite: "strict",
      maxAge: this.env.JWT_REFRESH_TOKEN_MAX_AGE,
    });

    return response.status(200).json();
  }
}
