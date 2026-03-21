import type { Request, Response } from "express";
import { z } from "zod";
import type { SendEmailUseCase } from "@/domain/application/use-cases/email/send-email";
import { HttpErrorHandler } from "@/infra/http/handlers/http-error-handler";
import {
  ensureUserId,
  validateRequest,
} from "@/infra/http/handlers/http-validation";

const sentEmailControllerBodySchema = z.object({
  client_id: z.uuid(),
  attachment_ids: z.array(z.uuid()),
});

export class SentEmailController {
  constructor(private readonly sentEmailUseCase: SendEmailUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const userId = ensureUserId(response, request.userId);

    if (!userId) {
      return response;
    }

    const body = validateRequest(
      response,
      sentEmailControllerBodySchema,
      request.body
    );

    if (!body) {
      return response;
    }

    const { attachment_ids, client_id } = body;

    const [error, result] = await this.sentEmailUseCase.execute({
      helperId: userId,
      attachmentIds: attachment_ids,
      clientId: client_id,
    });

    if (error) {
      return HttpErrorHandler.handle(response, error);
    }

    return response.status(200).json({
      message: "E-mail enviado com sucesso",
      data: {
        email_id: result.mailId.value,
      },
    });
  }
}
