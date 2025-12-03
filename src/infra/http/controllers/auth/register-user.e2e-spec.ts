import request from "supertest"

import { createApp } from "@/infra/app"

let app: ReturnType<typeof createApp>

describe("Register Helper E2E Tests", () => {
  beforeEach(() => {
    app = createApp()
  })

  it("should register a helper", async () => {
    const response = await request(app).post("/auth/register").send({
      name: "João Silva",
      email: "joao.silva@example.com",
      password: "senha123456",
    })

    expect(response.status).toBe(201)
  })
})
