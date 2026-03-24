import type { Logger, LoggerField } from "@/domain/application/logger/logger";

import { getEnv } from "../env";

type LogLevel = "info" | "error";

const SERVICE_NAME = "invoice-api";

const env = getEnv();

function write(level: LogLevel, message: string, fields: LoggerField = {}) {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message,
    "service.name": SERVICE_NAME,
    environment: env.ENVIRONMENT,
    ...fields,
  };

  process.stdout.write(`${JSON.stringify(log)}\n`);
}

class LocalLogger implements Logger {
  info(message: string, fields?: LoggerField) {
    write("info", message, fields);
  }

  error(message: string, fields?: LoggerField) {
    write("error", message, fields);
  }
}

export const logger: Logger = new LocalLogger();
