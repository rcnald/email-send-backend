export type Optional<Type, Key extends keyof Type> = Pick<Partial<Type>, Key> &
  Omit<Type, Key>
