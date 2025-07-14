import "dotenv/config"

import express from "express"

import { env } from "./env.ts"

const app = express()

app.use(express.json())

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`)
})
