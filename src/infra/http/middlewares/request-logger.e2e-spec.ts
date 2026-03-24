import request from "supertest";
import { afterEach, vi } from "vitest";

import { createApp } from "@/infra/app";

describe("requestLogger middleware e2e", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should emit request.started and request.finished as JSON lines", async () => {
    const app = createApp();
    const writeSpy = vi
      .spyOn(process.stdout, "write")
      .mockReturnValue(true as never);

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);

    const logs = writeSpy.mock.calls
      .map(([line]) => {
        if (typeof line !== "string") {
          return null;
        }

        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((value): value is Record<string, unknown> => value !== null);

    expect(logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "request.started" }),
        expect.objectContaining({ message: "request.finished" }),
      ])
    );
  });
});
