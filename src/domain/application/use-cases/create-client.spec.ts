import { makeClient } from "test/factories/make-client"
import { InMemoryClientRepository } from "test/in-memory-repositories/in-memory-client-repository"

import { CreateClientUseCase } from "./create-client"

let inMemoryClientRepository: InMemoryClientRepository
let sut: CreateClientUseCase

describe("CreateClientUseCase", () => {
  beforeEach(() => {
    inMemoryClientRepository = new InMemoryClientRepository()
    sut = new CreateClientUseCase(inMemoryClientRepository)
  })

  it("should return an error if client already exists", async () => {
    const client = makeClient({})

    inMemoryClientRepository.clients.push(client)

    const [error] = await sut.execute({
      name: client.name,
      CNPJ: client.CNPJ,
      accountant: client.accountant,
    })

    expect(error).toEqual({
      code: "CLIENT_ALREADY_EXISTS",
      message: "Client with this CNPJ already exists",
      data: { CNPJ: client.CNPJ },
    })
  })

  it("should return an error if email is not valid", async () => {
    const client = makeClient({
      accountant: { email: "invalid-email", name: "invalid-name" },
    })

    const [error] = await sut.execute({
      name: client.name,
      CNPJ: client.CNPJ,
      accountant: client.accountant,
    })

    expect(error).toEqual({
      code: "INVALID_EMAIL",
      message: "The accountant email provided is invalid",
      data: { email: client.accountant.email },
    })
  })

  it("should create a client with valid data", async () => {
    const client = makeClient()

    const [error, result] = await sut.execute({
      name: client.name,
      CNPJ: client.CNPJ,
      accountant: client.accountant,
    })

    expect(error).toBeUndefined()
    expect(result).toEqual({ clientId: expect.any(String) })
  })
})
