import { FakeEncrypter } from "test/criptography/fake-encrypter";
import { makeHelper } from "test/factories/make-helper";
import { InMemoryHelperRepository } from "test/in-memory-repositories/in-memory-helper-repository";
import { beforeEach, describe, expect, it } from "vitest";

import { RefreshTokenUseCase } from "./refresh-token";

let inMemoryHelperRepository: InMemoryHelperRepository;
let fakeEncrypter: FakeEncrypter;
let sut: RefreshTokenUseCase;

describe("RefreshTokenUseCase", () => {
  beforeEach(() => {
    inMemoryHelperRepository = new InMemoryHelperRepository();
    fakeEncrypter = new FakeEncrypter();
    sut = new RefreshTokenUseCase(inMemoryHelperRepository, fakeEncrypter);
  });

  it("should refresh access token with valid refresh token", async () => {
    const helper = makeHelper();
    await inMemoryHelperRepository.create(helper);

    const refreshToken = fakeEncrypter.encrypt({
      sub: helper.id.value,
      type: "refresh",
      expiresIn: "7d",
    });

    const [error, result] = await sut.execute({ refreshToken });

    expect(error).toBeUndefined();
    expect(result).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it("should not refresh with access token instead of refresh token", async () => {
    const helper = makeHelper();
    await inMemoryHelperRepository.create(helper);

    const accessToken = await fakeEncrypter.encrypt({
      sub: helper.id.toString(),
      type: "access",
      expiresIn: "15m",
    });

    const [error, result] = await sut.execute({ refreshToken: accessToken });

    expect(result).toBeUndefined();
    expect(error).toMatchObject({
      code: "UNAUTHORIZED",
      message: "Token must be a refresh token",
    });
  });

  it("should not refresh with invalid token", async () => {
    const [error, result] = await sut.execute({
      refreshToken: "invalid-token",
    });

    expect(result).toBeUndefined();
    expect(error).toMatchObject({
      code: "UNAUTHORIZED",
      message: "Invalid or expired refresh token",
    });
  });
});
