import "dotenv/config";

import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const envSchema = z.object({
  DATABASE_URL: z
    .url()
    .startsWith("postgres://")
    .or(z.url().startsWith("postgresql://")),
  APP_URL: z.url(),
  PORT: z.coerce.number().default(3333),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_URL: z.url(),
  S3_REGION: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  MAX_STORAGE: z.coerce
    .number()
    .positive()
    .default(5 * 1024 * 1024 * 1024), // 5 GB
  RESEND_API_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TOKEN_EXPIRATION: z.string().min(1),
  JWT_REFRESH_TOKEN_EXPIRATION: z.string().min(1),
  JWT_ACCESS_TOKEN_MAX_AGE: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  JWT_REFRESH_TOKEN_MAX_AGE: z.coerce.number().default(7 * 24 * 60 * 60 * 1000), // 7 days
  ENVIRONMENT: z
    .enum(["development", "production", "test"])
    .default("development"),
  SENTRY_DSN: z.url().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function getEnv() {
  const _env = envSchema.safeParse(process.env);

  if (!_env.success) {
    console.error("Variáveis de ambiente inválidas:", fromZodError(_env.error));

    throw new Error("Variáveis de ambiente inválidas.");
  }

  return _env.data;
}
