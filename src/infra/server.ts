import express from "express"

import { env } from "./env.ts"
import { router } from "./http/routes/index.ts"

const app = express()

app.use(express.json())

app.use(router)

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`)
})

export { app }
