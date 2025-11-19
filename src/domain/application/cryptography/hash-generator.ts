export abstract class HashGenerator {
  abstract generate(plainText: string): Promise<string>
}
