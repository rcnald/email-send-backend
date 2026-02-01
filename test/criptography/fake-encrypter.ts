import type {
  DecryptResponse,
  Encrypter,
  EncryptPayload,
} from "@/domain/application/cryptography/encrypter";

export class FakeEncrypter implements Encrypter {
  encrypt(payload: EncryptPayload): string {
    return JSON.stringify({
      sub: payload.sub,
      type: payload.type,
      expiresIn: payload.expiresIn ?? "13d",
    });
  }

  decrypt(token: string): DecryptResponse | null {
    try {
      const payload = JSON.parse(token) as DecryptResponse;

      return {
        sub: payload.sub,
        type: payload.type,
      };
    } catch {
      return null;
    }
  }
}
