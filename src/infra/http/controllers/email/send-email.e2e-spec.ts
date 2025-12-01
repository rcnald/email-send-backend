import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { S3Client } from "@aws-sdk/client-s3"
import { PrismaClient } from "@prisma/client"
import request from "supertest"
import { ClientFactory } from "test/factories/make-client"

import { UploadAndCreateAttachmentUseCase } from "@/domain/application/use-cases/attachment/upload-and-create-attachment"
import { createApp } from "@/infra/app"
import { PrismaAttachmentRepository } from "@/infra/database/prisma/repositories/prisma-attachment-repository"
import { getEnv } from "@/infra/env"
import { createS3Client } from "@/infra/lib/tebi"
import { TebiStorage } from "@/infra/storage/tebi"

let app: ReturnType<typeof createApp>

let uploadAndCreateAttachment: UploadAndCreateAttachmentUseCase
let attachmentRepository: PrismaAttachmentRepository
let clientFactory: ClientFactory
let uploader: TebiStorage
let prisma: PrismaClient
let tebiClient: S3Client

describe("Send Email E2E Tests", () => {
  beforeEach(() => {
    const env = getEnv()
    tebiClient = createS3Client()
    prisma = new PrismaClient()
    clientFactory = new ClientFactory(prisma)

    attachmentRepository = new PrismaAttachmentRepository(prisma)
    uploader = new TebiStorage(tebiClient, env)

    uploadAndCreateAttachment = new UploadAndCreateAttachmentUseCase(
      attachmentRepository,
      uploader,
    )

    app = createApp()
  })

  it("should sent an email", async () => {
    const testFilePath = resolve(__dirname, "../../../../../test/test-file.zip")
    const testFileBuffer = readFileSync(testFilePath)

    const client = await clientFactory.makePrismaClient({})

    const [_, result] = await uploadAndCreateAttachment.execute({
      fileName: "test-file.zip",
      fileType: "application/zip",
      body: testFileBuffer,
    })

    const response = await request(app)
      .post("/emails")
      .send({
        client_id: client.id.value,
        attachment_ids: [result?.attachment.id.value],
      })

    expect(response.status).toBe(200)
  })
})
