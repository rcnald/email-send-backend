import { Request, Response } from "express"

import { FetchClientsUseCase } from "@/domain/application/use-cases/fetch-clients"

import { ClientPresenter } from "../presenters/client-presenter"

export class FetchClientsController {
  constructor(private fetchClientsUseCase: FetchClientsUseCase) {}

  async handle(_: Request, response: Response): Promise<Response> {
    const [error, result] = await this.fetchClientsUseCase.execute()

    if (error) {
      return response.status(500).json({
        message: "An unexpected error occurred",
        data: {},
      })
    }

    return response.status(200).json({
      clients: result.clients.map(ClientPresenter.toHTTP),
    })
  }
}
