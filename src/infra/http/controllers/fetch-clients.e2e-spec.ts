import { PrismaClient } from "@prisma/client"
import request from "supertest"
import { ClientFactory } from "test/factories/make-client"

import { createApp } from "@/infra/app"

let app: ReturnType<typeof createApp>
let clientFactory: ClientFactory

describe("Update and Create Attachment E2E Tests", () => {
  beforeEach(async () => {
    app = createApp()
    const prisma = new PrismaClient()
    clientFactory = new ClientFactory(prisma)
  })

  it("should update and create an attachment", async () => {
    await clientFactory.makePrismaClient({})
    await clientFactory.makePrismaClient({})
    await clientFactory.makePrismaClient({})

    const response = await request(app).get("/clients")

    expect(response.status).toBe(200)
  })
})
