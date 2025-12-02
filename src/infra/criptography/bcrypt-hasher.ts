import bcrypt from "bcrypt"

import { HashGenerator } from "@/domain/application/cryptography/hash-generator"

export class BcryptHasher implements HashGenerator {
  async hash(plainText: string): Promise<string> {
    const saltRounds = 10

    const salt = await bcrypt.genSalt(saltRounds)

    const hashedValue = await bcrypt.hash(plainText, salt)

    return hashedValue
  }
}
