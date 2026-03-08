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
      return bad(DomainError.Unauthorized("Invalid or expired refresh token"));
    }

    if (payload.type !== "refresh") {
      return bad(DomainError.Unauthorized("Token must be a refresh token"));
    }

    if (payload.sub !== userId) {
      return bad(
        DomainError.Unauthorized(
          "Refresh token does not belong to authenticated user"
        )
      );
    }

    return nice();
  }
}
