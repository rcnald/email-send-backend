import { PrismaClient } from "@prisma/client"
import request from "supertest"
import { HelperFactory } from "test/factories/make-helper"

import { createApp } from "@/infra/app"
import { BcryptHasher } from "@/infra/cryptography/bcrypt-hasher"

let app: ReturnType<typeof createApp>
let helperFactory: HelperFactory
let prisma: PrismaClient
let hasher: BcryptHasher

describe("Authenticate (E2E)", () => {
  beforeEach(async () => {
    app = createApp()
    prisma = new PrismaClient()
    hasher = new BcryptHasher()
    helperFactory = new HelperFactory(prisma)
  })

  it("should authenticate a helper", async () => {
    const { helper } = await helperFactory.makePrismaHelper({
      password: await hasher.hash("valid-password"),
    })

    const response = await request(app).post("/auth/login").send({
      email: helper.email.value,
      password: "valid-password",
    })

    expect(response.status).toBe(200)
    expect(response.headers["set-cookie"]).toBeDefined()
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("accessToken="),
        expect.stringContaining("refreshToken="),
      ]),
    )
  })
})
