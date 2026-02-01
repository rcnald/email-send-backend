import { PrismaClient } from "@prisma/client";

import { AuthenticateUseCase } from "@/domain/application/use-cases/auth/authenticate";

import { BcryptHasher } from "../cryptography/bcrypt-hasher";
import { JwtEncrypter } from "../cryptography/jwt-encrypter";
import { PrismaHelperRepository } from "../database/prisma/repositories/prisma-helper-repository";
import { getEnv } from "../env";
import { AuthenticateController } from "../http/controllers/auth/authenticate";

export const makeAuthenticate = () => {
  const prisma = new PrismaClient();
  const helperRepository = new PrismaHelperRepository(prisma);
  const hasher = new BcryptHasher();
  const encrypter = new JwtEncrypter();
  const env = getEnv();

  const authenticateUseCase = new AuthenticateUseCase(
    helperRepository,
    hasher,
    encrypter,
    env
  );

  const authenticateController = new AuthenticateController(
    authenticateUseCase
  );

  return { authenticateController };
};
