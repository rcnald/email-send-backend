import type { Request, Response } from "express";

import type { GetProfileUseCase } from "@/domain/application/use-cases/helper/get-profile";

import { HttpErrorHandler } from "../../handlers/http-error-handler";
import { ensureUserId } from "../../handlers/http-validation";
import { ProfilePresenter } from "../../presenters/profile-presenter";

export class GetProfileController {
  constructor(private readonly getProfileUseCase: GetProfileUseCase) {}

  async handle(request: Request, response: Response) {
    const userId = ensureUserId(response, request.userId);

    if (!userId) {
      return response;
    }

    const [error, result] = await this.getProfileUseCase.execute({
      helperId: userId,
    });

    if (error) {
      return HttpErrorHandler.handle(response, error);
    }
    return response.status(200).json(ProfilePresenter.toHTTP(result));
  }
}
