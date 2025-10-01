import "dotenv/config"

import z from "zod"

const envSchema = z.object({
  DATABASE_URL: z
    .url()
    .startsWith("postgres://")
    .or(z.url().startsWith("postgresql://")),
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
  return envSchema.parse(process.env)
}
