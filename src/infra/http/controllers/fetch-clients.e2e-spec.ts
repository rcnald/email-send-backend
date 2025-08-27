import { PrismaClient } from "@prisma/client"
import request from "supertest"
import { ClientFactory } from "test/factories/make-client"
import { MailFactory } from "test/factories/make-mail"

import { createApp } from "@/infra/app"

let app: ReturnType<typeof createApp>
let clientFactory: ClientFactory
let mailFactory: MailFactory

describe("Update and Create Attachment E2E Tests", () => {
  beforeEach(async () => {
    app = createApp()
    const prisma = new PrismaClient()
    clientFactory = new ClientFactory(prisma)
    mailFactory = new MailFactory(prisma)
  })

  it("should update and create an attachment", async () => {
    const client = await clientFactory.makePrismaClient({})
    await clientFactory.makePrismaClient({})
    await clientFactory.makePrismaClient({})

    await mailFactory.makePrismaMail({
      clientId: client.id,
      sentAt: new Date(),
    })

    const response = await request(app).get("/clients")

    expect(response.status).toBe(200)
  })
})
