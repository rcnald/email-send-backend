import { HashGenerator } from "@/domain/application/cryptography/hash-generator"

export class FakeHasher implements HashGenerator {
  async generate(plainText: string): Promise<string> {
    return `hashed-${plainText}`
  }
}
