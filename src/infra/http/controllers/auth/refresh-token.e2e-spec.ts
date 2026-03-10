import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { HelperFactory } from "test/factories/make-helper";
import { beforeEach, describe, expect, it } from "vitest";

import { Email } from "@/domain/enterprise/entities/value-object/email";
import { createApp } from "@/infra/app";
import { BcryptHasher } from "@/infra/cryptography/bcrypt-hasher";

let app: ReturnType<typeof createApp>;
let helperFactory: HelperFactory;
let prisma: PrismaClient;
let hasher: BcryptHasher;

describe("Refresh Token (E2E)", () => {
  beforeEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    app = createApp();
    prisma = new PrismaClient();
    hasher = new BcryptHasher();
    helperFactory = new HelperFactory(prisma);
  });

  it("should refresh access token with valid refresh token", async () => {
    const hashedPassword = await hasher.hash("valid-password");

    await helperFactory.makePrismaHelper({
      name: "João Silva",
      email: Email.unsafeCreate("joao@example.com"),
      password: hashedPassword,
    });

    const loginResponse = await request(app).post("/auth/login").send({
      email: "joao@example.com",
      password: "valid-password",
    });

    const cookies = [...(loginResponse.headers["set-cookie"] || [])];

    expect(cookies).toBeDefined();

    const refreshTokenCookie = cookies.find((cookie: string) =>
      cookie.startsWith("refreshToken=")
    );

    expect(refreshTokenCookie).toBeDefined();

    const response = await request(app)
      .patch("/auth/token/refresh")
      .set("Cookie", refreshTokenCookie ?? "");

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringContaining("accessToken=")])
    );
  });
});
