import { S3Client } from "@aws-sdk/client-s3"

import { getEnv } from "../env"

export const createS3Client = () => {
  const env = getEnv()

  const tebiClient = new S3Client({
    endpoint: env.S3_URL,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_KEY,
    },
    region: env.S3_REGION,
    forcePathStyle: env.ENVIRONMENT === "test",
  })

  return tebiClient
}
