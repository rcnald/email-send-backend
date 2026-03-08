import { FakeEncrypter } from "test/criptography/fake-encrypter";
import { makeHelper } from "test/factories/make-helper";
import { beforeEach, describe, expect, it } from "vitest";

import { LogoutUseCase } from "./logout";

let fakeEncrypter: FakeEncrypter;
let sut: LogoutUseCase;

describe("LogoutUseCase", () => {
  beforeEach(() => {
    fakeEncrypter = new FakeEncrypter();
    sut = new LogoutUseCase(fakeEncrypter);
  });

  it("should logout when refresh token belongs to authenticated user", () => {
    const helper = makeHelper();

    const refreshToken = fakeEncrypter.encrypt({
      sub: helper.id.value,
      type: "refresh",
      expiresIn: "7d",
    });

    const [error, result] = sut.execute({
      userId: helper.id.value,
      refreshToken,
    });

    expect(error).toBeUndefined();
    expect(result).toBeUndefined();
  });

  it("should not logout with invalid token", () => {
    const [error, result] = sut.execute({
      userId: "any-user-id",
      refreshToken: "invalid-token",
    });

    expect(result).toBeUndefined();
    expect(error).toMatchObject({
      code: "UNAUTHORIZED",
      message: "Invalid or expired refresh token",
    });
  });

  it("should not logout if token type is access", () => {
    const helper = makeHelper();

    const accessToken = fakeEncrypter.encrypt({
      sub: helper.id.value,
      type: "access",
      expiresIn: "15m",
    });

    const [error, result] = sut.execute({
      userId: helper.id.value,
      refreshToken: accessToken,
    });

    expect(result).toBeUndefined();
    expect(error).toMatchObject({
      code: "UNAUTHORIZED",
      message: "Token must be a refresh token",
    });
  });

  it("should not logout if token belongs to another user", () => {
    const helper = makeHelper();

    const refreshToken = fakeEncrypter.encrypt({
      sub: helper.id.value,
      type: "refresh",
      expiresIn: "7d",
    });

    const [error, result] = sut.execute({
      userId: "another-user-id",
      refreshToken,
    });

    expect(result).toBeUndefined();
    expect(error).toMatchObject({
      code: "UNAUTHORIZED",
      message: "Refresh token does not belong to authenticated user",
    });
  });
});
