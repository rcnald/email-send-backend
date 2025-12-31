import { FakeEncrypter } from "test/criptography/fake-encrypter"
import { FakeHasher } from "test/criptography/fake-hasher"
import { makeHelper } from "test/factories/make-helper"
import { InMemoryHelperRepository } from "test/in-memory-repositories/in-memory-helper-repository"

import { Email } from "@/domain/enterprise/entities/value-object/email"
import { Env, getEnv } from "@/infra/env"

import { AuthenticateUseCase } from "./authenticate"

let inMemoryHelperRepository: InMemoryHelperRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter
let env: Env
let sut: AuthenticateUseCase

describe("AuthenticateUseCase", () => {
  beforeEach(() => {
    inMemoryHelperRepository = new InMemoryHelperRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()
    env = getEnv()
    sut = new AuthenticateUseCase(
      inMemoryHelperRepository,
      fakeHasher,
      fakeEncrypter,
      env,
    )
  })

  it("should return an error if email is not valid", async () => {
    const [error] = await sut.execute({
      email: "invalid-email",
      password: "some-password",
    })

    expect(error).toEqual({
      code: "INVALID_RESOURCE",
      message: "O Endereço de email fornecido é inválido",
      data: { email: "invalid-email" },
    })
  })

  it("should return an error if email is not correct", async () => {
    const helper = makeHelper({
      email: Email.unsafeCreate("test@test.com"),
    })

    inMemoryHelperRepository.helpers.push(helper)

    const [error] = await sut.execute({
      email: "non-existent-email@test.com",
      password: helper.password,
    })

    expect(error).toEqual({
      code: "UNAUTHORIZED",
      message: "Email ou senha inválidos",
      data: undefined,
    })
  })

  it("should return an error if password is not correct", async () => {
    const helper = makeHelper({
      password: "correct-password",
    })

    inMemoryHelperRepository.helpers.push(helper)

    const [error] = await sut.execute({
      email: helper.email.value,
      password: "incorrect-password",
    })

    expect(error).toEqual({
      code: "UNAUTHORIZED",
      message: "Email ou senha inválidos",
      data: undefined,
    })
  })

  it("should return a tokens if credentials are correct", async () => {
    const helper = makeHelper({
      email: Email.unsafeCreate("test@test.com"),
      password: await fakeHasher.hash("correct-password"),
    })

    inMemoryHelperRepository.helpers.push(helper)

    const [error, result] = await sut.execute({
      email: "test@test.com",
      password: "correct-password",
    })

    expect(error).toBeUndefined()
    expect(result).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
    )
  })
})
