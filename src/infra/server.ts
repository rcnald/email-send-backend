import { createApp } from "./app";
import { getEnv } from "./env";
import { logger } from "./logger/local";

const app = createApp();

const env = getEnv();

app.listen(env.PORT, () => {
  logger.info("server.started", {
    port: env.PORT,
    reference_url: `http://localhost:${env.PORT}/reference`,
  });
});
