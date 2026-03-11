import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { HelperFactory } from "test/factories/make-helper";

import { createApp } from "@/infra/app";
import { getEnv } from "@/infra/env";
import { createS3Client } from "@/infra/lib/tebi";

const MAX_STORAGE_IN_BYTES = 200 * 1024 * 1024;

let app: ReturnType<typeof createApp>;
let helperFactory: HelperFactory;
let prisma: PrismaClient;

describe("Update and Create Attachment E2E Tests", () => {
  beforeEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    process.env.MAX_STORAGE = String(MAX_STORAGE_IN_BYTES);
    app = createApp();
    prisma = new PrismaClient();
    helperFactory = new HelperFactory(prisma);
  });

  it("should update and create an attachment", async () => {
    const testFilePath = resolve(
      __dirname,
      "../../../../../test/test-file.zip"
    );
    const testFileBuffer = readFileSync(testFilePath);

    const { token } = await helperFactory.makePrismaHelper(
      {},
      { authenticated: true }
    );

    const response = await request(app)
      .post("/attachments")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", testFileBuffer, {
        filename: "test-file.zip",
        contentType: "application/zip",
      });

    expect(response.status).toBe(201);
  });

  it("should return error when bucket has reached max storage limit", async () => {
    const env = getEnv();
    const s3Client = createS3Client();
    const storageFillerKey = `storage-limit-filler-${Date.now()}.bin`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: storageFillerKey,
        Body: Buffer.alloc(MAX_STORAGE_IN_BYTES, 0),
        ContentType: "application/octet-stream",
      })
    );

    try {
      const testFilePath = resolve(
        __dirname,
        "../../../../../test/test-file.zip"
      );
      const testFileBuffer = readFileSync(testFilePath);

      const { token } = await helperFactory.makePrismaHelper(
        {},
        { authenticated: true }
      );

      const response = await request(app)
        .post("/attachments")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", testFileBuffer, {
          filename: "test-file.zip",
          contentType: "application/zip",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "OPERATION_FAILED",
        message: "Storage limit reached",
        data: {},
      });
    } finally {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: storageFillerKey,
        })
      );
    }
  });
});
