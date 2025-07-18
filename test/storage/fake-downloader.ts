import { Downloader } from "@/domain/application/storage/downloader"

export class FakeDownloader implements Downloader {
  async download(url: string): Promise<{ buffer: Buffer }> {
    return { buffer: Buffer.from("conteúdo do arquivo ok") }
  }
}
