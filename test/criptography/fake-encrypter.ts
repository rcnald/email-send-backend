import { Encrypter } from "@/domain/application/cryptography/encrypter"

export class FakeEncrypter implements Encrypter {
  async encrypt(payload: { sub: string; expiresIn: string }): Promise<string> {
    return `token-for-${payload.sub}-expires-in-${payload.expiresIn}`
  }
}
