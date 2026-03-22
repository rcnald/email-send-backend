import request from "supertest";
import { createApp } from "@/infra/app";

describe("rateLimit middleware", () => {
  it("should return 429 after more than 10 requests within 1 minute", async () => {
    const app = createApp();

    for (let index = 0; index < 10; index++) {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
    }

    const limitedResponse = await request(app).get("/health");

    expect(limitedResponse.status).toBe(429);
    expect(limitedResponse.body).toEqual({
      code: "TOO_MANY_REQUESTS",
      message: "Muitas requisições - Por favor, tente novamente mais tarde.",
      data: {},
    });
  });
});
