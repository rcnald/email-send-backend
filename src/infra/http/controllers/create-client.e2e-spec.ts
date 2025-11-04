import request from "supertest"

import { createApp } from "@/infra/app"

let app: ReturnType<typeof createApp>

describe("Create Client E2E Tests", () => {
  beforeEach(() => {
    app = createApp()
  })

  it("should create a client", async () => {
    const response = await request(app).post("/clients").send({
      name: "Client Name",
      CNPJ: "12345678000199",
      accountant_name: "Accountant Name",
      accountant_email: "accountant@example.com",
    })

    expect(response.status).toBe(201)
  })
})
