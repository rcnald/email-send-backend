import { Uploader } from "@/domain/application/storage/uploader"

export class FakeUploader implements Uploader {
  async upload({
    fileName,
  }: {
    fileName: string
    fileType: string
    body: Buffer
  }): Promise<{ url: string }> {
    return { url: `http://fakeurl.com/${fileName}` }
  }
}
