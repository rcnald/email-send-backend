export abstract class HashGenerator {
  abstract hash(plainText: string): Promise<string>;
}
