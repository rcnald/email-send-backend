import dayjs from "dayjs"
import { makeClient } from "test/factories/make-client"
import { makeMail } from "test/factories/make-mail"
import { InMemoryClientRepository } from "test/in-memory-repositories/in-memory-client-repository"

import { FetchClientsUseCase } from "./fetch-clients"

let inMemoryClientRepository: InMemoryClientRepository
let sut: FetchClientsUseCase

describe("FetchClientsUseCase", () => {
  beforeEach(() => {
    inMemoryClientRepository = new InMemoryClientRepository()
    sut = new FetchClientsUseCase(inMemoryClientRepository)
  })

  it("should return all clients", async () => {
    const client1 = makeClient()
    const client2 = makeClient()
    const client3 = makeClient()

    await inMemoryClientRepository.create(client1)
    await inMemoryClientRepository.create(client2)
    await inMemoryClientRepository.create(client3)

    const [_, result] = await sut.execute()

    expect(result.clients).toHaveLength(3)
    expect(result.clients).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          props: expect.objectContaining({
            clientId: client1.id,
            status: "not_sent",
          }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({
            clientId: client2.id,
            status: "not_sent",
          }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({
            clientId: client3.id,
            status: "not_sent",
          }),
        }),
      ]),
    )
  })

  it("should return status sent if client has been sent", async () => {
    const client1 = makeClient()
    const client2 = makeClient()
    const client3 = makeClient()

    inMemoryClientRepository.create(client1)
    inMemoryClientRepository.create(client2)
    inMemoryClientRepository.create(client3)

    const mail1 = makeMail({
      clientId: client1.id,
      sentAt: new Date(),
    })

    inMemoryClientRepository.mails.push(mail1)

    const [_, result] = await sut.execute()

    expect(result.clients).toHaveLength(3)
    expect(result.clients).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          props: expect.objectContaining({
            clientId: client1.id,
            status: "sent",
          }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({
            clientId: client2.id,
            status: "not_sent",
          }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({
            clientId: client3.id,
            status: "not_sent",
          }),
        }),
      ]),
    )
  })

  it("should consider only mails sent in the current month", async () => {
    const client1 = makeClient()
    const client2 = makeClient()
    const client3 = makeClient()

    inMemoryClientRepository.create(client1)
    inMemoryClientRepository.create(client2)
    inMemoryClientRepository.create(client3)

    const mail1 = makeMail({
      clientId: client1.id,
      sentAt: new Date(),
    })

    const mail2 = makeMail({
      clientId: client2.id,
      sentAt: dayjs().month(3).toDate(),
    })

    inMemoryClientRepository.mails.push(mail1)
    inMemoryClientRepository.mails.push(mail2)

    const [_, result] = await sut.execute()

    expect(result.clients).toHaveLength(3)
    expect(result.clients).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          props: expect.objectContaining({
            clientId: client1.id,
            status: "sent",
          }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({
            clientId: client2.id,
            status: "not_sent",
          }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({
            clientId: client3.id,
            status: "not_sent",
          }),
        }),
      ]),
    )
  })
})
