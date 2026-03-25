import type {
  Logger,
  LoggerField,
} from "@/domain/application/observability/logger";
import { getEnv } from "@/infra/env";

type LogLevel = "info" | "error";

const DEFAULT_SERVICE_NAME = "invoice-api";

class LocalLogger implements Logger {
  info(message: string, fields?: LoggerField) {
    this.write("info", message, fields);
  }

  error(message: string, fields?: LoggerField) {
    this.write("error", message, fields);
  }

  private write(level: LogLevel, message: string, fields: LoggerField = {}) {
    const log = {
      timestamp: new Date().toISOString(),
      level,
      message,
      "service.name": DEFAULT_SERVICE_NAME,
      environment: getEnv().ENVIRONMENT,
      ...fields,
    };

    const line = `${JSON.stringify(log)}\n`;

    process.stdout.write(line);
  }
}

export const logger: Logger = new LocalLogger();
