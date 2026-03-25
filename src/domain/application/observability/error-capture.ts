export interface CaptureHttpErrorInput {
  requestId?: string;
  method?: string;
  route?: string;
  statusCode: number;
  code?: string;
}

interface DisabledErrorCaptureConfig<TEvent> {
  enabled: false;
  eventCallback: (event: TEvent) => void;
}

interface EnabledErrorCaptureConfig {
  enabled: true;
}

export type InitErrorCaptureConfig<TEvent> =
  | DisabledErrorCaptureConfig<TEvent>
  | EnabledErrorCaptureConfig;

export abstract class ErrorCaptureGateway<TEvent = unknown> {
  abstract init(config: InitErrorCaptureConfig<TEvent>): void;
  abstract captureHttpError(input: CaptureHttpErrorInput): void;
  abstract shutDown(): void
}
