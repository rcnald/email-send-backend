import { randomUUID } from "node:crypto";

import type { NextFunction, Request, Response } from "express";

import { logger } from "@/infra/logger/local";

const REQUEST_ID_REGEX = /^[A-Za-z0-9_-]{8,64}$/;

function getSafeRoute(request: Request) {
  const routePath = request.route?.path;

  if (typeof routePath === "string") {
    return `${request.baseUrl || ""}${routePath}` || request.path;
  }

  return request.path;
}

function getOutcome(statusCode: number) {
  if (statusCode >= 500) {
    return "server_error";
  }

  if (statusCode >= 400) {
    return "client_error";
  }

  return "success";
}

function isValidRequestId(value: string) {
  return REQUEST_ID_REGEX.test(value);
}

export function requestLogger(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const startedAt = Date.now();
  const headerRequestId = request.header("x-request-id");
  const requestId =
    headerRequestId && isValidRequestId(headerRequestId)
      ? headerRequestId
      : randomUUID();

  request.requestId = requestId;

  logger.info("request.started", {
    "request.id": requestId,
    "http.method": request.method,
    "url.path": request.path,
  });

  response.on("finish", () => {
    const statusCode = response.statusCode;

    logger.info("request.finished", {
      "request.id": requestId,
      "http.method": request.method,
      "http.route": getSafeRoute(request),
      "http.status_code": statusCode,
      duration_ms: Date.now() - startedAt,
      "request.outcome": getOutcome(statusCode),
    });
  });

  next();
}
