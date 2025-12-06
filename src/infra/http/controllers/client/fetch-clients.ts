import { Request, Response } from "express"

import { FetchClientsUseCase } from "@/domain/application/use-cases/client/fetch-clients"
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler"

import { ClientWithStatusPresenter } from "../../presenters/client-with-status-presenter"

export class FetchClientsController {
  constructor(private fetchClientsUseCase: FetchClientsUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const userId = request.userId

    if (!userId || typeof userId !== "string") {
      return response.status(400).json({
        message: "Invalid or missing user ID",
        data: {},
      })
    }

    const [error, result] = await this.fetchClientsUseCase.execute({
      helperId: userId,
    })

    if (error) {
      return HttpErrorHandler.handle(response, error)
    }

    return response.status(200).json({
      clients: result.clients.map(ClientWithStatusPresenter.toHTTP),
    })
  }
}
