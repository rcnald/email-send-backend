import { createApp } from "./app"
import { getEnv } from "./env"

const app = createApp()

const env = getEnv()

app.listen(env.PORT, () => {
  console.log(`🚀 Server is running on port ${env.PORT}`)
})
