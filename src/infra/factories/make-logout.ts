import { LogoutUseCase } from "@/domain/application/use-cases/auth/logout";

import { JwtEncrypter } from "../cryptography/jwt-encrypter";
import { LogoutController } from "../http/controllers/auth/logout";

export const makeLogout = () => {
  const encrypter = new JwtEncrypter();
  const logoutUseCase = new LogoutUseCase(encrypter);
  const logoutController = new LogoutController(logoutUseCase);

  return { logoutController };
};
