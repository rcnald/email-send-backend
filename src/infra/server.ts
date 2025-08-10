import { createApp } from "./app"
import { getEnv } from "./env"

const app = createApp()

const env = getEnv()

app.listen(env.PORT, () => {
  if (env.ENVIRONMENT === "development") {
    console.log("Consult the API reference at http://localhost:3333/reference")
    console.log(`🚀 Server is running on port ${env.PORT}`)
  }
})
