import { Router } from "express";

import { JwtEncrypter } from "@/infra/cryptography/jwt-encrypter";

import { authMiddleware } from "../middlewares/auth";
import { createAttachmentRoutes } from "./attachment";
import { createAuthRoutes } from "./auth";
import { createClientRoutes } from "./client";
import { createEmailRoutes } from "./email";
import { createHelperRoutes } from "./helper";

export function createRouter() {
  const jwtEncrypter = new JwtEncrypter();
  const router = Router();

  router.use("/auth", createAuthRoutes());
  router.get("/health", (_, res) => res.status(200).send("OK"));

  router.use(
    "/attachments",
    authMiddleware(jwtEncrypter),
    createAttachmentRoutes()
  );
  router.use("/emails", authMiddleware(jwtEncrypter), createEmailRoutes());
  router.use("/clients", authMiddleware(jwtEncrypter), createClientRoutes());

  router.use("/", authMiddleware(jwtEncrypter), createHelperRoutes());

  return router;
}
