export interface EncryptPayload {
  sub: string
  type: "access" | "refresh"
  expiresIn: string
}
export interface Encrypter {
  encrypt(payload: EncryptPayload): Promise<string>
  decrypt(
    token: string,
  ): Promise<{ sub: string; type: "access" | "refresh" } | null>
}
