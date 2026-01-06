import { makeHelper } from "test/factories/make-helper"
import { InMemoryHelperRepository } from "test/in-memory-repositories/in-memory-helper-repository"

import { GetProfileUseCase } from "./get-profile"

let inMemoryHelperRepository: InMemoryHelperRepository
let sut: GetProfileUseCase

describe("GetProfileUseCase", () => {
  beforeEach(() => {
    inMemoryHelperRepository = new InMemoryHelperRepository()
    sut = new GetProfileUseCase(inMemoryHelperRepository)
  })

  it("should return the helper profile when found", async () => {
    const helper = makeHelper()

    await inMemoryHelperRepository.create(helper)

    const [error, result] = await sut.execute({
      helperId: helper.id.value,
    })

    expect(error).toBeUndefined()
    expect(result).toEqual(helper)
  })

  it("should return an error if helper is not found", async () => {
    const [error] = await sut.execute({
      helperId: "non-existent-id",
    })

    expect(error).toEqual({
      code: "NOT_FOUND",
      message: "Assistente não encontrado",
      data: { helperId: "non-existent-id" },
    })
  })
})
