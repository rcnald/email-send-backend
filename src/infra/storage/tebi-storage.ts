import { randomUUID } from "node:crypto"

import { PutObjectCommand } from "@aws-sdk/client-s3"

import { Uploader, UploadParams } from "@/domain/application/storage/uploader"

import { env } from "../env"
import { tebiClient } from "../lib/tebi"

export class TebiUploader implements Uploader {
  async upload({
    fileName,
    fileType,
    body,
  }: UploadParams): Promise<{ url: string }> {
    const uuid = randomUUID()

    const uniqueFilename = `${fileName}-${uuid}`

    await tebiClient.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: uniqueFilename,
        Body: body,
        ContentType: fileType,
      }),
    )

    return {
      url: uniqueFilename,
    }
  }
}
