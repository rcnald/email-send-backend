import request from "supertest"

import { createApp } from "@/infra/app"

let app: ReturnType<typeof createApp>

describe("Authenticate (E2E)", () => {
  beforeEach(async () => {
    app = createApp()
  })

  it("should authenticate a helper", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "joao@example.com",
      password: "senha123456",
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("accessToken")
    expect(response.headers["set-cookie"]).toBeDefined()
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("accessToken="),
        expect.stringContaining("refreshToken="),
      ]),
    )
  })
})
