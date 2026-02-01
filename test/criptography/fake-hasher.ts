import type { HashComparator } from "@/domain/application/cryptography/hash-comparator";
import type { HashGenerator } from "@/domain/application/cryptography/hash-generator";

export class FakeHasher implements HashGenerator, HashComparator {
  async compare(plainText: string, hashedText: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return hashedText === `hashed-${plainText}`;
  }

  async hash(plainText: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return `hashed-${plainText}`;
  }
}
