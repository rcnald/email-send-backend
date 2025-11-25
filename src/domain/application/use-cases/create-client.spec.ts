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
    const [clientError, client] = makeClient()

    if (clientError) return

    inMemoryClientRepository.clients.push(client)

    const [error] = await sut.execute({
      name: client.name,
      CNPJ: client.CNPJ,
      accountant: {
        name: client.accountant.name,
        email: client.accountant.email.value, // ← Extrai o valor do VO
      },
    })

    expect(error).toEqual({
      code: "CLIENT_ALREADY_EXISTS",
      message: "Client with this CNPJ already exists",
      data: { CNPJ: client.CNPJ },
    })
  })

  it("should return an error if email is not valid", async () => {
    const [error] = await sut.execute({
      name: "Test Company",
      CNPJ: "12345678000195",
      accountant: {
        name: "Invalid Name",
        email: "invalid-email",
      },
    })

    expect(error).toEqual({
      code: "INVALID_EMAIL",
      message: "The accountant email provided is invalid",
      data: { email: "invalid-email" },
    })
  })

  it("should create a client with valid data", async () => {
    const [_, validClient] = makeClient()

    if (_) return

    const [error, result] = await sut.execute({
      name: validClient.name,
      CNPJ: validClient.CNPJ,
      accountant: {
        name: validClient.accountant.name,
        email: validClient.accountant.email.value, // ← Extrai o valor do VO
      },
    })

    expect(error).toBeUndefined()
    expect(result).toEqual({ clientId: expect.any(String) })
    expect(inMemoryClientRepository.clients).toHaveLength(1)
  })

  it("should normalize email to lowercase", async () => {
    const [error, result] = await sut.execute({
      name: "Test Company",
      CNPJ: "12345678000195",
      accountant: {
        name: "João Silva",
        email: "JOAO@EMAIL.COM",
      },
    })

    expect(error).toBeUndefined()
    expect(result).toEqual({ clientId: expect.any(String) })

    const createdClient = inMemoryClientRepository.clients[0]
    expect(createdClient.accountant.email.value).toBe("joao@email.com")
  })
})
