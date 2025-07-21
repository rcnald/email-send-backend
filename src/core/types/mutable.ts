export type Mutable<T> = T extends Record<string, unknown> | readonly unknown[]
  ? {
      -readonly [P in keyof T]: Mutable<T[P]>
    }
  : T
