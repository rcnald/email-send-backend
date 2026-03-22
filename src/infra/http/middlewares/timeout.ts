import type { Request, Response } from "express";

export function requestTimeout(time: number) {
  return (_: Request, response: Response, next: () => void) => {
    response.setTimeout(time, () => {
      response.status(408).json({
        code: "REQUEST_TIMEOUT",
        message: "Requisição demorou mais do que o tempo limite permitido.",
        data: {},
      });
    });

    next();
  };
}
