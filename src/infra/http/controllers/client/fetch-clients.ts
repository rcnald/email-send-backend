import { Request, Response } from "express"

import { FetchClientsUseCase } from "@/domain/application/use-cases/client/fetch-clients"

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
      if (error.code === "HELPER_NOT_FOUND") {
        return response.status(404).json({
          message: "Helper not found",
          data: {
            helperId: error.data.helperId,
          },
        })
      }

      return response.status(500).json({
        message: "An unexpected error occurred",
        data: {},
      })
    }

    return response.status(200).json({
      clients: result.clients.map(ClientWithStatusPresenter.toHTTP),
    })
  }
}
