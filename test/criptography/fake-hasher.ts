import { HashComparator } from "@/domain/application/cryptography/hash-comparator"
import { HashGenerator } from "@/domain/application/cryptography/hash-generator"

export class FakeHasher implements HashGenerator, HashComparator {
  async compare(plainText: string, hashedText: string): Promise<boolean> {
    return hashedText === `hashed-${plainText}`
  }

  async hash(plainText: string): Promise<string> {
    return `hashed-${plainText}`
  }
}
