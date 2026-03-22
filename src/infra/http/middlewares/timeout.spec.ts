import type { Request, Response } from "express";
import { vi } from "vitest";

import { requestTimeout } from "./timeout";

describe("requestTimeout middleware", () => {
  it("should set timeout and return 408 when request exceeds the limit", () => {
    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const next = vi.fn();

    const response = {
      setTimeout: vi.fn(),
      status,
      json,
    } as unknown as Response;

    const middleware = requestTimeout(25_000);

    middleware({} as Request, response, next);

    expect(response.setTimeout).toHaveBeenCalledWith(
      25_000,
      expect.any(Function)
    );

    const onTimeout = vi.mocked(response.setTimeout).mock.calls[0]?.[1];

    expect(onTimeout).toBeTypeOf("function");
    expect(next).toHaveBeenCalledOnce();

    onTimeout?.();

    expect(status).toHaveBeenCalledWith(408);
    expect(json).toHaveBeenCalledWith({
      code: "REQUEST_TIMEOUT",
      message: "Requisição demorou mais do que o tempo limite permitido.",
      data: {},
    });
  });
});
