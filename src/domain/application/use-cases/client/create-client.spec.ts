import { makeClient } from "test/factories/make-client"
import { makeHelper } from "test/factories/make-helper"
import { InMemoryClientRepository } from "test/in-memory-repositories/in-memory-client-repository"
import { InMemoryHelperRepository } from "test/in-memory-repositories/in-memory-helper-repository"

import { CreateClientUseCase } from "./create-client"

let inMemoryClientRepository: InMemoryClientRepository
let inMemoryHelperRepository: InMemoryHelperRepository
let helper: ReturnType<typeof makeHelper>
let sut: CreateClientUseCase

describe("CreateClientUseCase", () => {
  beforeEach(() => {
    inMemoryClientRepository = new InMemoryClientRepository()
    inMemoryHelperRepository = new InMemoryHelperRepository()
    helper = makeHelper()
    inMemoryHelperRepository.create(helper)
    sut = new CreateClientUseCase(
      inMemoryClientRepository,
      inMemoryHelperRepository,
    )
  })

  it("should return an error if client already exists", async () => {
    const client = makeClient()

    inMemoryClientRepository.clients.push(client)

    const [error] = await sut.execute({
      helperId: helper.id.value,
      name: client.name,
      CNPJ: client.CNPJ,
      accountant: {
        name: client.accountant.name,
        email: client.accountant.email.value,
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
      helperId: helper.id.value,
      name: "Test Company",
      CNPJ: "12345678000195",
      accountant: {
        name: "Invalid Name",
        email: "invalid-email",
      },
    })

    expect(error).toEqual({
      code: "INVALID_EMAIL",
      message: "Invalid email format",
      data: { email: "invalid-email" },
    })
  })

  it("should create a client with valid data", async () => {
    const validClient = makeClient()

    const [error, result] = await sut.execute({
      helperId: helper.id.value,
      name: validClient.name,
      CNPJ: validClient.CNPJ,
      accountant: {
        name: validClient.accountant.name,
        email: validClient.accountant.email.value,
      },
    })

    expect(error).toBeUndefined()
    expect(result).toEqual({ clientId: expect.any(String) })
    expect(inMemoryClientRepository.clients).toHaveLength(1)
  })

  it("should normalize email to lowercase", async () => {
    const [error, result] = await sut.execute({
      helperId: helper.id.value,
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
