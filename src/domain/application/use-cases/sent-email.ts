export interface SentEmailUseCaseRequest {
  email: string
  clientCNPJ: string
  attachments: string[]
}

export class SentEmailUseCase {
  constructor() {}

  async execute() {}
}
