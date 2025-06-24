export interface RenamerParams {
  currentFileName: string
  newFileName: string
}

export abstract class Renamer {
  abstract rename(params: RenamerParams): Promise<{ url: string }>
}
