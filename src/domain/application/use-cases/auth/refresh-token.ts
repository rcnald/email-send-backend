import { DomainError } from "@/core/domain-error";
import { bad, nice } from "@/core/error";

import type { Encrypter } from "../../cryptography/encrypter";
import type { HelperRepository } from "../../repositories/helper-repository";

export interface RefreshTokenUseCaseRequest {
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly helperRepository: HelperRepository,
    private readonly encrypter: Encrypter
  ) {}

  async execute({ refreshToken }: RefreshTokenUseCaseRequest) {
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

    const helper = await this.helperRepository.findById(payload.sub);

    if (!helper) {
      return bad(DomainError.NotFound("Assistente nao encontrado"));
    }

    const accessToken = this.encrypter.encrypt({
      sub: helper.id.value,
      type: "access",
      expiresIn: "15m",
    });

    return nice({
      accessToken,
    });
  }
}
