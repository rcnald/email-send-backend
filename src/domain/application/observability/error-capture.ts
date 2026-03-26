export interface CaptureHttpErrorInput {
  requestId?: string;
  method?: string;
  route?: string;
  statusCode: number;
  code?: string;
}

export abstract class ErrorCaptureGateway {
  abstract init(): void;
  abstract captureHttpError(input: CaptureHttpErrorInput): void;
  abstract shutDown(): void;
}
