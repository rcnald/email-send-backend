import { FakeHasher } from "test/criptography/fake-hasher"
import { makeHelper } from "test/factories/make-helper"
import { InMemoryHelperRepository } from "test/in-memory-repositories/in-memory-helper-repository"

import { RegisterUserUseCase } from "./register-user"

let inMemoryHelperRepository: InMemoryHelperRepository
let fakeHasher: FakeHasher
let sut: RegisterUserUseCase

describe("CreateClientUseCase", () => {
  beforeEach(() => {
    inMemoryHelperRepository = new InMemoryHelperRepository()
    fakeHasher = new FakeHasher()
    sut = new RegisterUserUseCase(inMemoryHelperRepository, fakeHasher)
  })

  it("should return an error if client already exists", async () => {
    const helper = makeHelper({})

    inMemoryHelperRepository.helpers.push(helper)
    const [error] = await sut.execute({
      name: helper.name,
      email: helper.email,
      password: helper.password,
    })

    expect(error).toEqual({
      code: "HELPER_ALREADY_EXISTS",
      message: "Helper with this email already exists",
      data: { email: helper.email },
    })
  })

  it("should return an error if email is not valid", async () => {
    const helper = makeHelper({
      email: "invalid-email",
    })

    const [error] = await sut.execute({
      name: helper.name,
      email: helper.email,
      password: helper.password,
    })

    expect(error).toEqual({
      code: "INVALID_EMAIL",
      message: "The email provided is invalid",
      data: { email: helper.email },
    })
  })

  it("should create a helper with valid data", async () => {
    const helper = makeHelper()

    const [error, result] = await sut.execute({
      name: helper.name,
      email: helper.email,
      password: helper.password,
    })

    expect(error).toBeUndefined()
    expect(result).toEqual({ helperId: expect.any(String) })
  })
})
