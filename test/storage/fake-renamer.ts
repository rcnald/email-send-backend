import { Renamer, RenamerParams } from "@/domain/application/storage/renamer"

export class FakeRenamer implements Renamer {
  async rename({
    currentFileName,
    newFileName,
  }: RenamerParams): Promise<{ url: string }> {
    return { url: `http://fakeurl.com/${newFileName}` }
  }
}
