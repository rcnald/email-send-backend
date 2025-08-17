import { makeClient } from "test/factories/make-client"
import { InMemoryClientRepository } from "test/in-memory-repositories/in-memory-client-repository"

import { FetchClientsUseCase } from "./fetch-clients"

let inMemoryClientRepository: InMemoryClientRepository
let sut: FetchClientsUseCase

describe("FetchClientsUseCase", () => {
  beforeEach(() => {
    inMemoryClientRepository = new InMemoryClientRepository()
    sut = new FetchClientsUseCase(inMemoryClientRepository)
  })

  it("should return an error if attachment doesn't exists", async () => {
    const client1 = makeClient()
    const client2 = makeClient()
    const client3 = makeClient()

    inMemoryClientRepository.create(client1)
    inMemoryClientRepository.create(client2)
    inMemoryClientRepository.create(client3)

    const [_, result] = await sut.execute()

    expect(result.clients).toHaveLength(3)
    expect(result.clients).toEqual([client1, client2, client3])
  })
})
