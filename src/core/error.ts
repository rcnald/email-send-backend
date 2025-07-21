import { Mutable } from "./types/mutable"

export function warn<const T, const W>(result: T, warn: W) {
  return [undefined, result, warn] as [undefined, Mutable<T>, Mutable<W>]
}

export function bad<const T>(error: T) {
  return [error, undefined, undefined] as [Mutable<T>, undefined, undefined]
}

export function nice<const T = undefined>(result?: T) {
  return [undefined, result, undefined] as [undefined, Mutable<T>, undefined]
}
