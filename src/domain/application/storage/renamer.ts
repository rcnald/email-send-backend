export interface RenamerParams {
  currentFileUrl: string
  newFileUrl: string
}

export abstract class Renamer {
  abstract rename(params: RenamerParams): Promise<void>
}
