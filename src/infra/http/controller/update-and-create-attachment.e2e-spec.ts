import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import request from "supertest"

import { createApp } from "@/infra/app"

let app: ReturnType<typeof createApp>

describe("Update and Create Attachment E2E Tests", () => {
  beforeEach(async () => {
    app = createApp()
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

    expect(response.status).toBe(201)
  })
})
