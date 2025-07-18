import express from "express"

import { createRouter } from "./http/routes"

export function createApp() {
  const app = express()

  app.use(express.json())

  app.use(createRouter())

  return app
}
