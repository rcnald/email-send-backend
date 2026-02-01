import type { Request, Response } from "express";
import { z } from "zod";
import type { DeleteAttachmentUseCase } from "@/domain/application/use-cases/attachment/delete-attachment";
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler";
import { validateRequest } from "@/infra/http/handlers/http-validation";

const deleteAttachmentControllerRouteParamsSchema = z.object({
  id: z.uuid(),
});

export class DeleteAttachmentController {
  constructor(
    private readonly deleteAttachmentUseCase: DeleteAttachmentUseCase
  ) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const routeParams = validateRequest(
      response,
      deleteAttachmentControllerRouteParamsSchema,
      request.params,
      { message: "Invalid request params" }
    );

    if (!routeParams) {
      return response;
    }

    const { id } = routeParams;

    const [error] = await this.deleteAttachmentUseCase.execute({
      attachmentId: id,
    });

    if (error) {
      return HttpErrorHandler.handle(response, error);
    }

    return response.status(204).json({
      message: "Attachment deleted successfully",
    });
  }
}
