import { FakeHasher } from "test/criptography/fake-hasher"
import { makeHelper } from "test/factories/make-helper"
import { InMemoryHelperRepository } from "test/in-memory-repositories/in-memory-helper-repository"

import { UniqueId } from "@/core/entities/value-objects/unique-id"

import { RegisterUserUseCase } from "./register-user"

let inMemoryHelperRepository: InMemoryHelperRepository
let fakeHasher: FakeHasher
let sut: RegisterUserUseCase

describe("RegisterUserUseCase", () => {
  beforeEach(() => {
    inMemoryHelperRepository = new InMemoryHelperRepository()
    fakeHasher = new FakeHasher()
    sut = new RegisterUserUseCase(inMemoryHelperRepository, fakeHasher)
  })

  it("should return an error if client already exists", async () => {
    const [helperError, helper] = makeHelper()

    if (helperError) return

    inMemoryHelperRepository.helpers.push(helper)

    const [error] = await sut.execute({
      name: helper.name,
      email: helper.email.value,
      password: helper.password,
    })

    expect(error).toEqual({
      code: "HELPER_ALREADY_EXISTS",
      message: "Helper with this email already exists",
      data: { email: helper.email.value },
    })
  })

  it("should return an error if email is not valid", async () => {
    const [helperError, helper] = makeHelper()

    if (helperError) return

    const [error] = await sut.execute({
      name: helper.name,
      email: "invalid-email",
      password: helper.password,
    })

    expect(error).toEqual({
      code: "INVALID_EMAIL",
      message: "Invalid email format",
      data: { email: "invalid-email" },
    })
  })

  it("should create a helper with valid data", async () => {
    const [helperError, helper] = makeHelper()

    if (helperError) return

    const [error, result] = await sut.execute({
      name: helper.name,
      email: helper.email.value,
      password: helper.password,
    })

    expect(error).toBeUndefined()
    expect(result).toEqual({ helperId: expect.any(UniqueId) })
  })
})
