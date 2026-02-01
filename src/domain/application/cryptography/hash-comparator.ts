export abstract class HashComparator {
  abstract compare(plainText: string, hashedText: string): Promise<boolean>;
}
