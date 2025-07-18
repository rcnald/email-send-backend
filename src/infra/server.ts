import { createApp } from "./app"
import { env } from "./env"

const app = createApp()

app.listen(env.PORT, () => {
  console.log(`🚀 Server is running on port ${env.PORT}`)
})
