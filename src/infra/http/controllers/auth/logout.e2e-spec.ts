import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { HelperFactory } from "test/factories/make-helper";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/infra/app";
import { JwtEncrypter } from "@/infra/cryptography/jwt-encrypter";

let app: ReturnType<typeof createApp>;
let helperFactory: HelperFactory;
let prisma: PrismaClient;
let encrypter: JwtEncrypter;

describe("Logout (E2E)", () => {
  beforeEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    app = createApp();
    prisma = new PrismaClient();
    encrypter = new JwtEncrypter();
    helperFactory = new HelperFactory(prisma);
  });

  it("should logout and clear auth cookies when tokens belong to same user", async () => {
    const { helper, token } = await helperFactory.makePrismaHelper(
      {},
      { authenticated: true }
    );
    const refreshToken = encrypter.encrypt({
      sub: helper.id.value,
      type: "refresh",
      expiresIn: "7d",
    });
    const accessTokenCookie = `accessToken=${token ?? ""}`;
    const refreshTokenCookie = `refreshToken=${refreshToken}`;

    const response = await request(app)
      .post("/auth/logout")
      .set("Cookie", [accessTokenCookie, refreshTokenCookie]);

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("accessToken=;"),
        expect.stringContaining("refreshToken=;"),
      ])
    );
  });

  it("should not logout when refresh token belongs to another user", async () => {
    const { token: accessTokenFromA } = await helperFactory.makePrismaHelper(
      {},
      { authenticated: true }
    );
    const { helper: helperB } = await helperFactory.makePrismaHelper(
      {},
      { authenticated: true }
    );
    const refreshTokenFromB = encrypter.encrypt({
      sub: helperB.id.value,
      type: "refresh",
      expiresIn: "7d",
    });
    const accessTokenCookieFromA = `accessToken=${accessTokenFromA ?? ""}`;
    const refreshTokenCookieFromB = `refreshToken=${refreshTokenFromB}`;

    const response = await request(app)
      .post("/auth/logout")
      .set("Cookie", [accessTokenCookieFromA, refreshTokenCookieFromB]);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      code: "UNAUTHORIZED",
      message: "O token de atualizacao nao pertence ao usuario autenticado",
    });
  });
});
