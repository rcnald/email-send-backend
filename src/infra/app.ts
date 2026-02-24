import { apiReference } from "@scalar/express-api-reference";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import swaggerDocs from "../../docs/swagger.json";
import { getEnv } from "./env";
import { createRouter } from "./http/routes";

export function createApp() {
  const app = express();
  const env = getEnv();

  app.set("trust proxy", 1); // safe to add

  const corsOptions = {
    origin: [env.APP_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));

  app.use(
    "/reference",
    apiReference({
      spec: {
        content: swaggerDocs,
      },
    })
  );

  app.use(express.json());
  app.use(cookieParser());

  app.use(createRouter());

  return app;
}
