import { apiReference } from "@scalar/express-api-reference"
import cors from "cors"
import express from "express"

import * as swaggerDocs from "../../docs/swagger.json"
import { getEnv } from "./env"
import { createRouter } from "./http/routes"

export function createApp() {
  const app = express()
  const env = getEnv()

  app.use(
    cors({
      origin: env.APP_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )

  app.use(
    "/reference",
    apiReference({
      spec: {
        content: swaggerDocs,
      },
    }),
  )

  app.use(express.json())

  app.use(createRouter())

  return app
}
