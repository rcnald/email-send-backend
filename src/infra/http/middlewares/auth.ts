import type { NextFunction, Request, Response } from "express";

import type { Encrypter } from "@/domain/application/cryptography/encrypter";

export function authMiddleware(encrypter: Encrypter) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await new Promise((resolve) => setTimeout(resolve, 10));

    try {
      const token =
        req.cookies?.accessToken ||
        req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({
          code: "UNAUTHORIZED",
          message: "Não autorizado - Token não fornecido",
          data: {},
        });
      }

      const payload = encrypter.decrypt(token);

      if (!payload) {
        return res.status(401).json({
          code: "UNAUTHORIZED",
          message: "Não autorizado - Token inválido ou expirado",
          data: {},
        });
      }

      if (payload.type !== "access") {
        return res.status(401).json({
          code: "UNAUTHORIZED",
          message: "Não autorizado - Tipo de token inválido",
          data: {},
        });
      }

      req.userId = payload.sub;
      next();
    } catch {
      return res.status(401).json({
        code: "UNAUTHORIZED",
        message: "Não autorizado - Token inválido",
        data: {},
      });
    }
  };
}
