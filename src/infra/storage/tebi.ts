import { randomUUID } from "node:crypto"

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { Downloader } from "@/domain/application/storage/downloader"
import { Renamer, RenamerParams } from "@/domain/application/storage/renamer"
import { Uploader, UploadParams } from "@/domain/application/storage/uploader"

import { env } from "../env"
import { tebiClient } from "../lib/tebi"

export class TebiStorage implements Uploader, Renamer, Downloader {
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
    const uuid = randomUUID()

    await tebiClient.send(
      new CopyObjectCommand({
        Bucket: env.S3_BUCKET,
        CopySource: `${env.S3_BUCKET}/${currentFileName}`,
        Key: `${newFileName}-${uuid}`,
      }),
    )

    await tebiClient.send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: currentFileName,
      }),
    )

    return {
      url: `${newFileName}-${uuid}`,
    }
  }

  async download(url: string): Promise<{ buffer: Buffer }> {
    const signedUrl = await getSignedUrl(
      tebiClient,
      new GetObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: url,
      }),
      { expiresIn: 300 },
    )

    const response = await fetch(signedUrl)

    return {
      buffer: Buffer.from(await response.arrayBuffer()),
    }
  }
}
