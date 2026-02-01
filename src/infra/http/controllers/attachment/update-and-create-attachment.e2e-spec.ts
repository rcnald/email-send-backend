import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { HelperFactory } from "test/factories/make-helper";

import { createApp } from "@/infra/app";

let app: ReturnType<typeof createApp>;
let helperFactory: HelperFactory;
let prisma: PrismaClient;

describe("Update and Create Attachment E2E Tests", () => {
  beforeEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
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
});
