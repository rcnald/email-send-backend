import bcrypt from "bcrypt";

import type { HashComparator } from "@/domain/application/cryptography/hash-comparator";
import type { HashGenerator } from "@/domain/application/cryptography/hash-generator";

export class BcryptHasher implements HashGenerator, HashComparator {
  async hash(plainText: string): Promise<string> {
    const saltRounds = 10;

    const salt = await bcrypt.genSalt(saltRounds);

    const hashedValue = await bcrypt.hash(plainText, salt);

    return hashedValue;
  }

  async compare(plainText: string, hashedText: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return bcrypt.compare(plainText, hashedText);
  }
}
