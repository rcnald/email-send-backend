export type Mutable<T> = T extends Record<string, unknown> | readonly any[]
  ? {
      -readonly [P in keyof T]: Mutable<T[P]>
    }
  : T
