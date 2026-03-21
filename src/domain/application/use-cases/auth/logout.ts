import { DomainError } from "@/core/domain-error";
import { bad, nice } from "@/core/error";

import type { Encrypter } from "../../cryptography/encrypter";

export interface LogoutUseCaseRequest {
  userId: string;
  refreshToken: string;
}

export class LogoutUseCase {
  constructor(private readonly encrypter: Encrypter) {}

  execute({ userId, refreshToken }: LogoutUseCaseRequest) {
    const payload = this.encrypter.decrypt(refreshToken);

    if (!payload) {
      return bad(
        DomainError.Unauthorized("Token de atualizacao invalido ou expirado")
      );
    }

    if (payload.type !== "refresh") {
      return bad(
        DomainError.Unauthorized("O token deve ser um token de atualizacao")
      );
    }

    if (payload.sub !== userId) {
      return bad(
        DomainError.Unauthorized(
          "O token de atualizacao nao pertence ao usuario autenticado"
        )
      );
    }

    return nice();
  }
}
