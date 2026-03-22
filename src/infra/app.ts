import { apiReference } from "@scalar/express-api-reference";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import swaggerDocs from "../../docs/swagger.json";
import { getEnv } from "./env";
import { requestTimeout } from "./http/middlewares/timeout";
import { createRouter } from "./http/routes";

const ALLOW_CONFIG = /.*/;

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
  app.options(ALLOW_CONFIG, cors(corsOptions));

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

  app.use(createRouter());

  return app;
}
