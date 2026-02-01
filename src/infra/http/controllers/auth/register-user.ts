import type { Request, Response } from "express";
import { z } from "zod";
import type { RegisterUserUseCase } from "@/domain/application/use-cases/auth/register-user";
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler";
import { validateRequest } from "@/infra/http/handlers/http-validation";

const registerUserControllerBodySchema = z.object({
  name: z
    .string()
    .min(3, { error: "Nome deve ter pelo menos 3 caracteres" })
    .max(30, { error: "Nome deve ter no máximo 30 caracteres" }),
  email: z.email("Endereço de email inválido"),
  password: z
    .string()
    .min(6, { error: "Senha deve ter pelo menos 6 caracteres" })
    .max(100, { error: "Senha deve ter no máximo 100 caracteres" }),
});

export class RegisterUserController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const body = validateRequest(
      response,
      registerUserControllerBodySchema,
      request.body
    );

    if (!body) {
      return response;
    }

    const { name, email, password } = body;

    const [error] = await this.registerUserUseCase.execute({
      name,
      email,
      password,
    });

    if (error) {
      return HttpErrorHandler.handle(response, error);
    }

    return response.status(201).json();
  }
}
