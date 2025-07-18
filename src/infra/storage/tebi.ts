import { randomUUID } from "node:crypto"

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"

// import { injectable } from "tsyringe"
import { Renamer, RenamerParams } from "@/domain/application/storage/renamer"
import { Uploader, UploadParams } from "@/domain/application/storage/uploader"

import { env } from "../env"
import { tebiClient } from "../lib/tebi"

// @injectable()
export class TebiStorage implements Uploader, Renamer {
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

  async rename({
    currentFileName,
    newFileName,
  }: RenamerParams): Promise<{ url: string }> {
    await tebiClient.send(
      new CopyObjectCommand({
        Bucket: env.S3_BUCKET,
        CopySource: `${env.S3_BUCKET}/${currentFileName}`,
        Key: newFileName,
      }),
    )

    await tebiClient.send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: currentFileName,
      }),
    )

    return {
      url: newFileName,
    }
  }
}
