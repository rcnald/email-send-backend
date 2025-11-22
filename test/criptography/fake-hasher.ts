import { HashGenerator } from "@/domain/application/cryptography/hash-generator"

export class FakeHasher implements HashGenerator {
  async hash(plainText: string): Promise<string> {
    return `hashed-${plainText}`
  }
}
