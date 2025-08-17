import { S3Client } from "@aws-sdk/client-s3"
import { PrismaClient } from "@prisma/client"
import request from "supertest"
import { AttachmentFactory } from "test/factories/make-attachment"

import { Uploader } from "@/domain/application/storage/uploader"
import { createApp } from "@/infra/app"
import { getEnv } from "@/infra/env"
import { createS3Client } from "@/infra/lib/tebi"
import { TebiStorage } from "@/infra/storage/tebi"

let app: ReturnType<typeof createApp>

let attachmentFactory: AttachmentFactory
let uploader: Uploader
let prisma: PrismaClient
let tebiClient: S3Client

describe("Delete attachment E2E Tests", () => {
  beforeEach(() => {
    const env = getEnv()
    prisma = new PrismaClient()
    tebiClient = createS3Client()
    uploader = new TebiStorage(tebiClient, env)
    attachmentFactory = new AttachmentFactory(prisma, uploader)

    app = createApp()
  })

  it("should delete attachment", async () => {
    const attachment = await attachmentFactory.makePrismaAttachment()

    const response = await request(app).delete(
      `/attachments/${attachment.id}/delete`,
    )

    expect(response.status).toBe(204)
  })
})
