import { apiReference } from "@scalar/express-api-reference"
import cors from "cors"
import express from "express"

import * as swaggerDocs from "../../docs/swagger.json"
import { createRouter } from "./http/routes"

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: "http://localhost:5173",
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
