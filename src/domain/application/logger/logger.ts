export interface LoggerField {
  "request.id"?: string;
  "http.method"?: string;
  "http.route"?: string;
  "http.status_code"?: number;
  "url.path"?: string;
  "request.outcome"?: "success" | "client_error" | "server_error";
  duration_ms?: number;
  port?: number;
  reference_url?: string;
  "error.type"?: string;
  "error.safe_message"?: string;
}

export abstract class Logger {
  abstract info(message: string, fields?: LoggerField): void;
  abstract error(message: string, fields?: LoggerField): void;
}
