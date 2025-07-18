export abstract class Downloader {
  abstract download(url: string): Promise<{ buffer: Buffer }>
}
