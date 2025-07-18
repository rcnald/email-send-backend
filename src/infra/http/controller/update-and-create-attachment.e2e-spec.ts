import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import request from "supertest"

import { createApp } from "@/infra/app"
import { env } from "@/infra/env"
import { tebiClient } from "@/infra/lib/tebi"

let fileUrl: string | null = null
let app: ReturnType<typeof createApp>

describe("Update and Create Attachment E2E Tests", () => {
  beforeEach(async () => {
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
