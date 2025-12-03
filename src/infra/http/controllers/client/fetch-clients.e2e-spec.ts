import { PrismaClient } from "@prisma/client"
import request from "supertest"
import { ClientFactory } from "test/factories/make-client"
import { HelperFactory } from "test/factories/make-helper"
import { MailFactory } from "test/factories/make-mail"

import { UniqueId } from "@/core/entities/value-objects/unique-id"
import { createApp } from "@/infra/app"

let app: ReturnType<typeof createApp>
let clientFactory: ClientFactory
let mailFactory: MailFactory
let helperFactory: HelperFactory

describe("Update and Create Attachment E2E Tests", () => {
  beforeEach(async () => {
    app = createApp()
    const prisma = new PrismaClient()
    clientFactory = new ClientFactory(prisma)
    helperFactory = new HelperFactory(prisma)
    mailFactory = new MailFactory(prisma)
  })

  it("should update and create an attachment", async () => {
    const { token } = await helperFactory.makePrismaHelper(
      {},
      { authenticated: true },
    )
    const client = await clientFactory.makePrismaClient({})
    await clientFactory.makePrismaClient({})
    await clientFactory.makePrismaClient({})

    await mailFactory.makePrismaMail({
      clientId: new UniqueId(client.id.value),
      sentAt: new Date(),
    })

    const response = await request(app)
      .get("/clients")
      .set("Authorization", `Bearer ${token}`)

    expect(response.status).toBe(200)
  })
})
