import { randomUUID } from "node:crypto"
import path from "node:path"

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { bad, nice } from "@/core/error"
import { Deleter, DeleterParams } from "@/domain/application/storage/deleter"
import { Downloader } from "@/domain/application/storage/downloader"
import { Renamer, RenamerParams } from "@/domain/application/storage/renamer"
import { Uploader, UploadParams } from "@/domain/application/storage/uploader"

import { Env } from "../env"

export class TebiStorage implements Uploader, Renamer, Downloader, Deleter {
  constructor(
    private tebiClient: S3Client,
    private env: Env,
  ) {}

  async upload({
    fileName,
    fileType,
    body,
  }: UploadParams): Promise<
    | [undefined, { url: string }, undefined]
    | [
        { code: "FAILED_TO_UPLOAD"; message: "Failed to upload file" },
        undefined,
        undefined,
      ]
  > {
    const uuid = randomUUID()

    const extension = path.extname(fileName)

    const baseName = path.basename(fileName, extension)

    const uniqueFilename = `${baseName}-${uuid}${extension}`

    const result = await this.tebiClient.send(
      new PutObjectCommand({
        Bucket: this.env.S3_BUCKET,
        Key: uniqueFilename,
        Body: body,
        ContentType: fileType,
      }),
    )

    if (result.$metadata.httpStatusCode !== 200) {
      return bad({
        code: "FAILED_TO_UPLOAD",
        message: "Failed to upload file",
      })
    }

    return nice({ url: uniqueFilename })
  }

  async rename({ currentFileUrl, newFileUrl }: RenamerParams): Promise<void> {
    await this.tebiClient.send(
      new CopyObjectCommand({
        Bucket: this.env.S3_BUCKET,
        CopySource: `${this.env.S3_BUCKET}/${currentFileUrl}`,
        Key: newFileUrl,
      }),
    )

    await this.tebiClient.send(
      new DeleteObjectCommand({
        Bucket: this.env.S3_BUCKET,
        Key: currentFileUrl,
      }),
    )
  }

  async download(url: string): Promise<
    | [undefined, { buffer: Buffer<ArrayBufferLike> }, undefined]
    | [
        {
          code: "FAILED_TO_DOWNLOAD"
          message: "Failed to download file"
          file: string
        },
        undefined,
        undefined,
      ]
  > {
    try {
      const signedUrl = await getSignedUrl(
        this.tebiClient,
        new GetObjectCommand({
          Bucket: this.env.S3_BUCKET,
          Key: url,
        }),
        { expiresIn: 300 },
      )

      const response = await fetch(signedUrl)

      if (!response.ok) {
        return bad({
          code: "FAILED_TO_DOWNLOAD",
          message: "Failed to download file",
          file: url,
        })
      }

      return nice({ buffer: Buffer.from(await response.arrayBuffer()) })
    } catch {
      return bad({
        code: "FAILED_TO_DOWNLOAD",
        message: "Failed to download file",
        file: url,
      })
    }
  }

  async delete(params: DeleterParams): Promise<
    | [undefined, void, undefined]
    | [
        { code: "FAILED_TO_DELETE"; message: "Failed to delete file" },
        undefined,
        undefined,
      ]
    | [
        {
          code: "ATTACHMENT_NOT_FOUND_ON_SERVER"
          message: "Attachment not found on server"
        },
        undefined,
        undefined,
      ]
  > {
    const { url } = params

    try {
      await this.tebiClient.send(
        new GetObjectCommand({
          Bucket: this.env.S3_BUCKET,
          Key: url,
        }),
      )

      await this.tebiClient.send(
        new DeleteObjectCommand({
          Bucket: this.env.S3_BUCKET,
          Key: url,
        }),
      )

      return nice()
    } catch (error) {
      if ((error as { name?: unknown }).name === "NoSuchKey") {
        return bad({
          code: "ATTACHMENT_NOT_FOUND_ON_SERVER",
          message: "Attachment not found on server",
        })
      }

      return bad({
        code: "FAILED_TO_DELETE",
        message: "Failed to delete file",
      })
    }
  }
}
