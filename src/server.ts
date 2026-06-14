import "dotenv/config"
import app from "./app"
import { worker } from "./queues/message.worker"
import { logger } from "./utils/logger"

const PORT = Number(process.env.PORT) || 4001

// Startup validation
if (!process.env.CHANNEL_SERVICE_SECRET) {
  logger.error("CHANNEL_SERVICE_SECRET is not set. Refusing to start.")
  process.exit(1)
}

if (!process.env.ARIA_CALLBACK_URL) {
  logger.error("ARIA_CALLBACK_URL is not set. Refusing to start.")
  process.exit(1)
}

app.listen(PORT, () => {
  logger.info(`ARIA Channel Service running on port ${PORT}`)
  logger.info(`Callback target: ${process.env.ARIA_CALLBACK_URL}`)
  logger.info(`Worker concurrency: ${process.env.MAX_CONCURRENCY || 50}`)
})

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received — shutting down gracefully")
  await worker.close()
  process.exit(0)
})
