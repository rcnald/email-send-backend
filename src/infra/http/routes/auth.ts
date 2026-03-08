import { type Request, type Response, Router } from "express";
import { JwtEncrypter } from "@/infra/cryptography/jwt-encrypter";
import { makeAuthenticate } from "@/infra/factories/make-authenticate";
import { makeLogout } from "@/infra/factories/make-logout";
import { makeRefreshToken } from "@/infra/factories/make-refresh-token";
import { makeRegisterUser } from "@/infra/factories/make-register-user";
import { authMiddleware } from "@/infra/http/middlewares/auth";

export const createAuthRoutes = () => {
  const authRoutes = Router();
  const jwtEncrypter = new JwtEncrypter();

  const { authenticateController } = makeAuthenticate();
  const { logoutController } = makeLogout();
  const { refreshTokenController } = makeRefreshToken();
  const { createHelperController } = makeRegisterUser();

  authRoutes.post("/register", (request: Request, response: Response) => {
    createHelperController.handle(request, response);
  });

  authRoutes.post("/login", (request: Request, response: Response) => {
    authenticateController.handle(request, response);
  });

  authRoutes.patch("/token/refresh", (request: Request, response: Response) => {
    refreshTokenController.handle(request, response);
  });

  authRoutes.post(
    "/logout",
    authMiddleware(jwtEncrypter),
    (request: Request, response: Response) => {
      logoutController.handle(request, response);
    }
  );

  return authRoutes;
};
