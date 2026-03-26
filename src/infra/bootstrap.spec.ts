import { startServer } from "@/infra/bootstrap";

describe("startServer", () => {
  it("initializes sentry before starting app listen", () => {
    const calls: string[] = [];
    let initCallCount = 0;

    startServer({
      initErrorCapture: () => {
        initCallCount += 1;
        calls.push("init");
      },
      createApp: () => ({}) as never,
      getEnv: () => ({ PORT: 3333 }) as never,
      listen: ({ onListen }) => {
        calls.push("listen");
        onListen();
      },
      logServerStarted: () => {
        calls.push("log");
      },
    });

    expect(initCallCount).toBe(1);
    expect(calls).toEqual(["init", "listen", "log"]);
  });
});
