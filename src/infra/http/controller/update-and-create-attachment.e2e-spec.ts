import { execSync } from "node:child_process"
import { randomUUID } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { config } from "dotenv"
import request from "supertest"

import { env } from "@/infra/env"
import { prisma } from "@/infra/lib/prisma"
import { tebiClient } from "@/infra/lib/tebi"
import { app } from "@/infra/server"

const schemaId = randomUUID()
let fileUrl: string | null = null

describe("Update and Create Attachment E2E Tests", () => {
  beforeAll(async () => {
    config({ path: ".env.test", override: true })

    const database_url = new URL(env.DATABASE_URL)

    database_url.searchParams.set("schema", schemaId)

    process.env.DATABASE_URL = database_url.toString()

    execSync("npx prisma migrate deploy")
  })

  afterAll(async () => {
    await prisma.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`,
    )
    await prisma.$disconnect()
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

  it("should update and create an attachment", async () => {
    const testFilePath = resolve(__dirname, "../../../../test/test-file.zip")
    const testFileBuffer = readFileSync(testFilePath)

    const response = await request(app)
      .post("/attachments")
      .attach("attachmentFile", testFileBuffer, {
        filename: "test-file.zip",
        contentType: "application/zip",
      })

    fileUrl = response.body.props.url

    expect(response.status).toBe(201)
  })
})
