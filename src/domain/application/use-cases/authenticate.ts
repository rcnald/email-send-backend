import { Encrypter } from "../cryptography/encrypter"
import { HashComparator } from "../cryptography/hash-comparator"
import { HashGenerator } from "../cryptography/hash-generator"
import { HelperRepository } from "../repositories/helper-repository"

export interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

export class AuthenticateUseCase {
  constructor(
    private helperRepository: HelperRepository,
    private hashComparator: HashComparator,
    private encrypter: Encrypter,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<string> {}
}
