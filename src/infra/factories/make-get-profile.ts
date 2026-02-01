import { PrismaClient } from "@prisma/client";

import { GetProfileUseCase } from "@/domain/application/use-cases/helper/get-profile";

import { PrismaHelperRepository } from "../database/prisma/repositories/prisma-helper-repository";
import { GetProfileController } from "../http/controllers/helper/get-profile";

export const makeGetProfile = () => {
  const prisma = new PrismaClient();
  const helperRepository = new PrismaHelperRepository(prisma);

  const getProfileUseCase = new GetProfileUseCase(helperRepository);

  const getProfileController = new GetProfileController(getProfileUseCase);
  return { getProfileController };
};
