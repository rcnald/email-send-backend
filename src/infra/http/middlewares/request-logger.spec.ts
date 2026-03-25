import type { NextFunction, Request, Response } from "express";
import { afterEach, vi } from "vitest";

import { logger } from "@/infra/observability/local-logger";

import { requestLogger } from "./request-logger";

describe("requestLogger middleware", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makeRequest(overrides?: Partial<Request>) {
    const header = vi.fn().mockReturnValue(undefined);

    return {
      method: "GET",
      path: "/health",
      baseUrl: "",
      route: { path: "/health" },
      header,
      ...overrides,
    } as unknown as Request;
  }

  function makeResponse() {
    const listeners = new Map<string, () => void>();

    const response = {
      statusCode: 200,
      on: vi.fn((event: string, callback: () => void) => {
        listeners.set(event, callback);
        return response;
      }),
    } as unknown as Response;

    return {
      response,
      emit(event: string) {
        listeners.get(event)?.();
      },
    };
  }

  it("should assign requestId from valid x-request-id header", () => {
    const request = makeRequest({
      header: vi.fn().mockReturnValue("valid_req_123"),
    });
    const { response } = makeResponse();
    const next = vi.fn() as NextFunction;

    requestLogger(request, response, next);

    expect(request.requestId).toBe("valid_req_123");
    expect(next).toHaveBeenCalledOnce();
  });

  it("should fallback to UUID when x-request-id is invalid", () => {
    const request = makeRequest({
      header: vi.fn().mockReturnValue("bad"),
    });
    const { response } = makeResponse();
    const next = vi.fn() as NextFunction;

    requestLogger(request, response, next);

    expect(request.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(next).toHaveBeenCalledOnce();
  });

  it("should log request.started and request.finished with allowlisted fields", () => {
    const request = makeRequest();
    const { response, emit } = makeResponse();
    const next = vi.fn() as NextFunction;
    const infoSpy = vi
      .spyOn(logger, "info")
      .mockImplementation(() => undefined);

    requestLogger(request, response, next);
    emit("finish");

    expect(infoSpy).toHaveBeenNthCalledWith(
      1,
      "request.started",
      expect.objectContaining({
        "request.id": expect.any(String),
        "http.method": "GET",
        "url.path": "/health",
      })
    );

    expect(infoSpy).toHaveBeenNthCalledWith(
      2,
      "request.finished",
      expect.objectContaining({
        "request.id": expect.any(String),
        "http.method": "GET",
        "http.route": "/health",
        "http.status_code": 200,
        duration_ms: expect.any(Number),
        "request.outcome": "success",
      })
    );
  });

  it("should classify 4xx and 5xx outcomes correctly", () => {
    const request = makeRequest();
    const { response, emit } = makeResponse();
    const next = vi.fn() as NextFunction;
    const infoSpy = vi
      .spyOn(logger, "info")
      .mockImplementation(() => undefined);

    requestLogger(request, response, next);

    response.statusCode = 404;
    emit("finish");

    expect(infoSpy).toHaveBeenLastCalledWith(
      "request.finished",
      expect.objectContaining({ "request.outcome": "client_error" })
    );

    response.statusCode = 503;
    emit("finish");

    expect(infoSpy).toHaveBeenLastCalledWith(
      "request.finished",
      expect.objectContaining({ "request.outcome": "server_error" })
    );
  });
});
