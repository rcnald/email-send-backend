import "dotenv/config"

import z from "zod"
import { fromZodError } from "zod-validation-error"

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
  RESEND_API_KEY: z.string().min(1),
  ENVIRONMENT: z
    .enum(["development", "production", "test"])
    .default("development"),
})

export type Env = z.infer<typeof envSchema>

export function getEnv() {
  const _env = envSchema.safeParse(process.env)

  if (!_env.success) {
    console.error("Invalid environment variables:", fromZodError(_env.error))

    throw new Error("Invalid environment variables.")
  }

  return _env.data
}
