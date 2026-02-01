import { PrismaClient } from "@prisma/client";

import { RefreshTokenUseCase } from "@/domain/application/use-cases/auth/refresh-token";

import { JwtEncrypter } from "../cryptography/jwt-encrypter";
import { PrismaHelperRepository } from "../database/prisma/repositories/prisma-helper-repository";
import { RefreshTokenController } from "../http/controllers/auth/refresh-token";

export const makeRefreshToken = () => {
  const prisma = new PrismaClient();
  const helperRepository = new PrismaHelperRepository(prisma);
  const encrypter = new JwtEncrypter();

  const refreshTokenUseCase = new RefreshTokenUseCase(
    helperRepository,
    encrypter
  );

  const refreshTokenController = new RefreshTokenController(
    refreshTokenUseCase
  );

  return { refreshTokenController };
};
