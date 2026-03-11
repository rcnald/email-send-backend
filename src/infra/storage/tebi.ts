import { randomUUID } from "node:crypto";
import path from "node:path";

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { DomainError } from "@/core/domain-error";
import { bad, nice } from "@/core/error";
import type {
  Deleter,
  DeleterParams,
} from "@/domain/application/storage/deleter";
import type { Downloader } from "@/domain/application/storage/downloader";
import type {
  Renamer,
  RenamerParams,
} from "@/domain/application/storage/renamer";
import type {
  Uploader,
  UploadParams,
} from "@/domain/application/storage/uploader";

import type { Env } from "../env";

export class TebiStorage implements Uploader, Renamer, Downloader, Deleter {
  constructor(
    private readonly tebiClient: S3Client,
    private readonly env: Env
  ) {}

  async upload({
    fileName,
    fileType,
    body,
  }: UploadParams): Promise<
    | [undefined, { url: string }, undefined]
    | [
        ReturnType<typeof DomainError.ExternalServiceFailed>,
        undefined,
        undefined,
      ]
  > {
    const usedStorage = await this.getBucketUsage();
    const fileSize = body.length;

    if (usedStorage + fileSize > this.env.MAX_STORAGE) {
      return bad(DomainError.OperationFailed("Storage limit reached"));
    }

    const uuid = randomUUID();

    const extension = path.extname(fileName);

    const baseName = path.basename(fileName, extension);

    const uniqueFilename = `${baseName}-${uuid}${extension}`;

    const result = await this.tebiClient.send(
      new PutObjectCommand({
        Bucket: this.env.S3_BUCKET,
        Key: uniqueFilename,
        Body: body,
        ContentType: fileType,
      })
    );

    if (result.$metadata.httpStatusCode !== 200) {
      return bad(DomainError.ExternalServiceFailed("Failed to upload file"));
    }

    return nice({ url: uniqueFilename });
  }

  private async getBucketUsage(): Promise<number> {
    let totalSize = 0;
    let continuationToken: string | undefined;

    do {
      const response = await this.tebiClient.send(
        new ListObjectsV2Command({
          Bucket: this.env.S3_BUCKET,
          ContinuationToken: continuationToken,
        })
      );

      if (response.Contents) {
        for (const object of response.Contents) {
          totalSize += object.Size ?? 0;
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return totalSize;
  }

  async rename({ currentFileUrl, newFileUrl }: RenamerParams): Promise<void> {
    await this.tebiClient.send(
      new CopyObjectCommand({
        Bucket: this.env.S3_BUCKET,
        CopySource: `${this.env.S3_BUCKET}/${currentFileUrl}`,
        Key: newFileUrl,
      })
    );

    await this.tebiClient.send(
      new DeleteObjectCommand({
        Bucket: this.env.S3_BUCKET,
        Key: currentFileUrl,
      })
    );
  }

  async download(
    url: string
  ): Promise<
    | [undefined, { buffer: Buffer<ArrayBufferLike> }, undefined]
    | [
        ReturnType<typeof DomainError.ExternalServiceFailed>,
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
        { expiresIn: 300 }
      );

      const response = await fetch(signedUrl);

      if (!response.ok) {
        return bad(
          DomainError.ExternalServiceFailed("Failed to download file", {
            file: url,
          })
        );
      }

      return nice({ buffer: Buffer.from(await response.arrayBuffer()) });
    } catch {
      return bad(
        DomainError.ExternalServiceFailed("Failed to download file", {
          file: url,
        })
      );
    }
  }

  async delete(
    params: DeleterParams
  ): Promise<
    | [undefined, undefined, undefined]
    | [
        ReturnType<typeof DomainError.ExternalServiceFailed>,
        undefined,
        undefined,
      ]
    | [ReturnType<typeof DomainError.NotFound>, undefined, undefined]
  > {
    const { url } = params;

    try {
      await this.tebiClient.send(
        new GetObjectCommand({
          Bucket: this.env.S3_BUCKET,
          Key: url,
        })
      );

      await this.tebiClient.send(
        new DeleteObjectCommand({
          Bucket: this.env.S3_BUCKET,
          Key: url,
        })
      );

      return nice();
    } catch (error) {
      if ((error as { name?: unknown }).name === "NoSuchKey") {
        return bad(DomainError.NotFound("Attachment not found on server"));
      }

      return bad(DomainError.ExternalServiceFailed("Failed to delete file"));
    }
  }
}
