import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { HelperFactory } from "test/factories/make-helper";

import { Email } from "@/domain/enterprise/entities/value-object/email";
import { createApp } from "@/infra/app";

let app: ReturnType<typeof createApp>;
let helperFactory: HelperFactory;
let prisma: PrismaClient;

describe("Get Profile E2E Tests", () => {
  beforeEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    app = createApp();
    prisma = new PrismaClient();
    helperFactory = new HelperFactory(prisma);
  });

  it("should return the authenticated helper profile", async () => {
    const { helper, token } = await helperFactory.makePrismaHelper(
      {
        name: "João Silva",
        email: Email.unsafeCreate("joao.silva@example.com"),
      },
      { authenticated: true }
    );

    const response = await request(app)
      .get("/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      name: helper.name,
      email: helper.email.value,
    });
  });
});
