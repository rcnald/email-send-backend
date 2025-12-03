import { NextFunction, Request, Response } from "express"

import { Encrypter } from "@/domain/application/cryptography/encrypter"

export function authMiddleware(encrypter: Encrypter) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.headers.authorization?.replace("Bearer ", "")

      if (!token) {
        return res.status(401).json({
          message: "Unauthorized - Token not provided",
          data: {},
        })
      }

      const payload = encrypter.decrypt(token)

      if (!payload) {
        return res.status(401).json({
          message: "Unauthorized - Invalid or expired token",
          data: {},
        })
      }

      if (payload.type !== "access") {
        return res.status(401).json({
          message: "Unauthorized - Invalid token type",
          data: {},
        })
      }

      req.userId = payload.sub
      next()
    } catch {
      return res.status(401).json({
        message: "Unauthorized - Invalid token",
        data: {},
      })
    }
  }
}
