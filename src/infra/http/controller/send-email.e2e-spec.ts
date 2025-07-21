import { randomUUID } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { S3Client } from "@aws-sdk/client-s3"
import { PrismaClient } from "@prisma/client"
import request from "supertest"

import { UploadAndCreateAttachmentUseCase } from "@/domain/application/use-cases/upload-and-create-attachment"
import { Client } from "@/domain/enterprise/entities/client"
import { createApp } from "@/infra/app"
import { PrismaAttachmentRepository } from "@/infra/database/prisma/repositories/prisma-attachment-repository"
import { PrismaClientRepository } from "@/infra/database/prisma/repositories/prisma-client-repository"
import { getEnv } from "@/infra/env"
import { createS3Client } from "@/infra/lib/tebi"
import { TebiStorage } from "@/infra/storage/tebi"

let app: ReturnType<typeof createApp>

let uploadAndCreateAttachment: UploadAndCreateAttachmentUseCase
let attachmentRepository: PrismaAttachmentRepository
let clientRepository: PrismaClientRepository
let uploader: TebiStorage
let prisma: PrismaClient
let tebiClient: S3Client

describe("Send Email E2E Tests", () => {
  beforeEach(() => {
    const env = getEnv()
    tebiClient = createS3Client()
    prisma = new PrismaClient()
    clientRepository = new PrismaClientRepository(prisma)
    attachmentRepository = new PrismaAttachmentRepository(prisma)
    uploader = new TebiStorage(tebiClient, env)

    uploadAndCreateAttachment = new UploadAndCreateAttachmentUseCase(
      attachmentRepository,
      uploader,
    )

    app = createApp()
  })

  it("should sent an email", async () => {
    const testFilePath = resolve(__dirname, "../../../../test/test-file.zip")
    const testFileBuffer = readFileSync(testFilePath)

    const clientId = randomUUID()

    await clientRepository.create(
      Client.create(
        {
          name: "Rcnald SA",
          CNPJ: "12345678000195",
          accountant: {
            email: "ronaldomjunio05@gmail.com",
            name: "Ronaldo Junior",
          },
        },
        clientId,
      ),
    )
    const [_, result] = await uploadAndCreateAttachment.execute({
      fileName: "test-file.zip",
      fileType: "application/zip",
      body: testFileBuffer,
    })

    const response = await request(app)
      .post("/emails")
      .send({
        clientId,
        attachmentIds: [result?.attachment.id],
      })

    expect(response.status).toBe(200)
  })
})
