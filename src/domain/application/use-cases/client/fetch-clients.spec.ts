import dayjs from "dayjs"
import { makeClient } from "test/factories/make-client"
import { makeHelper } from "test/factories/make-helper"
import { makeMail } from "test/factories/make-mail"
import { InMemoryClientRepository } from "test/in-memory-repositories/in-memory-client-repository"
import { InMemoryHelperRepository } from "test/in-memory-repositories/in-memory-helper-repository"

import { FetchClientsUseCase } from "./fetch-clients"

let inMemoryClientRepository: InMemoryClientRepository
let inMemoryHelperRepository: InMemoryHelperRepository
let sut: FetchClientsUseCase

describe("FetchClientsUseCase", () => {
  beforeEach(() => {
    inMemoryClientRepository = new InMemoryClientRepository()
    inMemoryHelperRepository = new InMemoryHelperRepository()
    sut = new FetchClientsUseCase(
      inMemoryClientRepository,
      inMemoryHelperRepository,
    )
  })

  it("should return all clients", async () => {
    const helper = makeHelper()

    inMemoryHelperRepository.helpers.push(helper)

    const client1 = makeClient({ helperId: helper.id })
    const client2 = makeClient({ helperId: helper.id })
    const client3 = makeClient({ helperId: helper.id })

    await inMemoryClientRepository.create(client1)
    await inMemoryClientRepository.create(client2)
    await inMemoryClientRepository.create(client3)

    const [error, result] = await sut.execute({ helperId: helper.id.value })

    expect(error).toBeUndefined()
    expect(result?.clients).toHaveLength(3)
    expect(result?.clients).toEqual(
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
    const helper = makeHelper()

    inMemoryHelperRepository.helpers.push(helper)

    const client1 = makeClient({ helperId: helper.id })
    const client2 = makeClient({ helperId: helper.id })
    const client3 = makeClient({ helperId: helper.id })

    await inMemoryClientRepository.create(client1)
    await inMemoryClientRepository.create(client2)
    await inMemoryClientRepository.create(client3)

    const mail1 = makeMail({
      clientId: client1.id,
      sentAt: new Date(),
    })

    inMemoryClientRepository.mails.push(mail1)

    const [error, result] = await sut.execute({ helperId: helper.id.value })

    expect(error).toBeUndefined()
    expect(result?.clients).toHaveLength(3)
    expect(result?.clients).toEqual(
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

  it("should return error if helper does not exist", async () => {
    const [error, result] = await sut.execute({
      helperId: "non-existent-helper-id",
    })

    expect(result).toBeUndefined()
    expect(error).toEqual({
      code: "HELPER_NOT_FOUND",
      message: "Helper not found",
      data: { helperId: "non-existent-helper-id" },
    })
  })

  it("should consider only mails sent in the current month", async () => {
    const helper = makeHelper()

    inMemoryHelperRepository.helpers.push(helper)

    const client1 = makeClient({ helperId: helper.id })
    const client2 = makeClient({ helperId: helper.id })
    const client3 = makeClient({ helperId: helper.id })

    await inMemoryClientRepository.create(client1)
    await inMemoryClientRepository.create(client2)
    await inMemoryClientRepository.create(client3)

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

    const [error, result] = await sut.execute({ helperId: helper.id.value })

    expect(error).toBeUndefined()
    expect(result?.clients).toHaveLength(3)
    expect(result?.clients).toEqual(
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
