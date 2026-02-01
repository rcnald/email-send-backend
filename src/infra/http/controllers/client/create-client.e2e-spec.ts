import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { HelperFactory } from "test/factories/make-helper";

import { createApp } from "@/infra/app";

let app: ReturnType<typeof createApp>;
let helperFactory: HelperFactory;
let prisma: PrismaClient;

describe("Create Client E2E Tests", () => {
  beforeEach(() => {
    app = createApp();
    prisma = new PrismaClient();
    helperFactory = new HelperFactory(prisma);
  });

  it("should create a client", async () => {
    const { token } = await helperFactory.makePrismaHelper(
      {},
      { authenticated: true }
    );

    const response = await request(app)
      .post("/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Client Name",
        CNPJ: "12345678000199",
        accountant_name: "Accountant Name",
        accountant_email: "accountant@example.com",
      });

    expect(response.status).toBe(201);
  });
});
