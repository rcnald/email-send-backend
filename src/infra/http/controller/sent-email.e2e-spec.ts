import { randomUUID } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { PrismaClient } from "@prisma/client"
import request from "supertest"

import { UploadAndCreateAttachmentUseCase } from "@/domain/application/use-cases/upload-and-create-attachment"
import { Client } from "@/domain/enterprise/entities/client"
import { createApp } from "@/infra/app"
import { PrismaAttachmentRepository } from "@/infra/database/prisma/repositories/prisma-attachment-repository"
import { PrismaClientRepository } from "@/infra/database/prisma/repositories/prisma-client-repository"
import { env } from "@/infra/env"
import { tebiClient } from "@/infra/lib/tebi"
import { TebiStorage } from "@/infra/storage/tebi"

let fileUrl: string | null = null
let app: ReturnType<typeof createApp>

let uploadAndCreateAttachment: UploadAndCreateAttachmentUseCase
let attachmentRepository: PrismaAttachmentRepository
let clientRepository: PrismaClientRepository
let uploader: TebiStorage

describe("Send Email E2E Tests", () => {
  // beforeAll(async () => {
  //   config({ path: ".env.test", override: true })

  //   const database_url = new URL(env.DATABASE_URL)

  //   database_url.searchParams.set("schema", schemaId)

  //   process.env.DATABASE_URL = database_url.toString()

  //   execSync("npx prisma migrate deploy")
  // })

  // afterAll(async () => {
  //   await prisma.$executeRawUnsafe(
  //     `DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`,
  //   )
  //   await prisma.$disconnect()
  // })

  beforeEach(() => {
    const prisma = new PrismaClient()
    clientRepository = new PrismaClientRepository(prisma)
    attachmentRepository = new PrismaAttachmentRepository(prisma)
    uploader = new TebiStorage()
    uploadAndCreateAttachment = new UploadAndCreateAttachmentUseCase(
      attachmentRepository,
      uploader,
    )

    app = createApp()
  })

  afterEach(async () => {
    if (fileUrl) {
      try {
        await tebiClient.send(
          new DeleteObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: fileUrl,
          }),
        )
      } catch (error) {
        console.error("Failed to delete object test from S3:", error)
      } finally {
        fileUrl = null
      }
    }
  })

  it("should sent an email", async () => {
    const testFilePath = resolve(__dirname, "../../../../test/test-file.zip")
    const testFileBuffer = readFileSync(testFilePath)

    const clientId = randomUUID()

    await clientRepository.create(
      Client.create(
        {
          name: "Test Client",
          CNPJ: "12345678000195",
          accountant: {
            email: "ronaldomjunio05@gmail.com",
            name: "Ronaldo Junior",
          },
        },
        clientId,
      ),
    )
    const [_error, result] = await uploadAndCreateAttachment.execute({
      fileName: "test-file.zip",
      fileType: "application/zip",
      body: testFileBuffer,
    })

    fileUrl = result?.attachment.url ?? null

    const response = await request(app)
      .post("/emails")
      .send({
        email: "ronaldomjunior05@gmail.com",
        clientId,
        attachmentIds: [result?.attachment.id],
      })

    expect(response.status).toBe(200)
  })
})
