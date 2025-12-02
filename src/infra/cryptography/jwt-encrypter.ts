import jwt from "jsonwebtoken"

import {
  DecryptResponse,
  Encrypter,
  EncryptPayload,
} from "@/domain/application/cryptography/encrypter"

import { Env, getEnv } from "../env"

export class JwtEncrypter implements Encrypter {
  constructor(private env: Env = getEnv()) {}

  encrypt({ sub, type, expiresIn }: EncryptPayload): string {
    const token = jwt.sign(
      {
        sub,
        type,
      },
      this.env.JWT_SECRET,
      {
        expiresIn,
      } as jwt.SignOptions,
    )

    return token
  }

  decrypt(token: string): DecryptResponse | null {
    try {
      const decoded = jwt.verify(token, this.env.JWT_SECRET) as DecryptResponse

      return decoded
    } catch {
      return null
    }
  }
}
