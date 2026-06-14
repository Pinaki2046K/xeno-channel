import express from "express"
import cors from "cors"
import helmet from "helmet"
import { randomUUID } from "crypto"
import { dispatchRouter } from "./routes/dispatch.route"
import { healthRouter } from "./routes/health.route"
import { errorMiddleware } from "./middleware/error.middleware"
import { logger } from "./utils/logger"

const app = express()

// Security
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "https://your-aria-app.vercel.app",
  methods: ["GET", "POST"]
}))

// Body parsing — limit to 2MB (500 messages * ~4KB each max)
app.use(express.json({ limit: "2mb" }))

// Request ID & logging
app.use((req, _res, next) => {
  req.headers["x-request-id"] = randomUUID()
  logger.info(`${req.method} ${req.path} [${req.headers["x-request-id"]}]`)
  next()
})

// Routes
app.use("/dispatch", dispatchRouter)
app.use("/health",   healthRouter)

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" })
})

// Global error handler
app.use(errorMiddleware)

export default app
