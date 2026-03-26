import { apiReference } from "@scalar/express-api-reference";
import cookieParser from "cookie-parser";
import cors from "cors";
import type { Express } from "express";
import express from "express";
import rateLimit from "express-rate-limit";
import swaggerDocs from "../../docs/swagger.json";
import { getEnv } from "./env";
import { unexpectedErrorHandler } from "./http/handlers/unexpected-error-handler";
import { requestLogger } from "./http/middlewares/request-logger";
import { requestTimeout } from "./http/middlewares/timeout";
import { createRouter } from "./http/routes";

const ALLOW_CONFIG = /.*/;

interface CreateAppOptions {
  registerTestRoutes?: (app: Express) => void;
}

export function createApp(options: CreateAppOptions = {}) {
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
  app.options(ALLOW_CONFIG, cors(corsOptions));
  app.use(requestLogger);

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
  app.use(requestTimeout(25_000));
  app.use(
    rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 10, // Limit each IP to 10 requests per windowMs
      message: {
        code: "TOO_MANY_REQUESTS",
        message: "Muitas requisições - Por favor, tente novamente mais tarde.",
        data: {},
      },
      statusCode: 429,
      standardHeaders: true, // Return rate limit info in headers
      legacyHeaders: false,
    })
  );

  options.registerTestRoutes?.(app);

  app.use(createRouter());
  app.use(unexpectedErrorHandler);

  return app;
}
