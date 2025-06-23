import { Mutable } from "./types/mutable"

export function bad<const T>(error: T) {
  return [error, undefined] as [Mutable<T>, undefined]
}

export function nice<const T = undefined>(result?: T) {
  return [undefined, result] as [undefined, Mutable<T>]
}
