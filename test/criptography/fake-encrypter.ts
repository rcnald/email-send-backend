import {
  Encrypter,
  EncryptPayload,
} from "@/domain/application/cryptography/encrypter"

export class FakeEncrypter implements Encrypter {
  async encrypt(payload: EncryptPayload): Promise<string> {
    return JSON.stringify({
      sub: payload.sub,
      type: payload.type,
      expiresIn: payload.expiresIn,
    })
  }

  async decrypt(
    token: string,
  ): Promise<{ sub: string; type: "access" | "refresh" } | null> {
    try {
      const payload = JSON.parse(token) as {
        sub: string
        type: "access" | "refresh"
        expiresIn: string
      }

      return {
        sub: payload.sub,
        type: payload.type,
      }
    } catch {
      return null
    }
  }
}
