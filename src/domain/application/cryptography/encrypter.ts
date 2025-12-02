export interface EncryptPayload {
  sub: string
  type: "access" | "refresh"
  expiresIn: string
}

export interface DecryptResponse {
  sub: string
  type: "access" | "refresh"
}

export interface Encrypter {
  encrypt(payload: EncryptPayload): string
  decrypt(token: string): DecryptResponse | null
}
