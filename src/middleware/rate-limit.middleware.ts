import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

// Make sure to use the correct Redis constructor for @upstash/ratelimit
// It expects an @upstash/redis instance, not ioredis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// Create a new ratelimiter, that allows 10 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
})

export async function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1"
    const identifier = Array.isArray(ip) ? ip[0] : ip
    
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier)

    res.setHeader("X-RateLimit-Limit", limit.toString())
    res.setHeader("X-RateLimit-Remaining", remaining.toString())
    res.setHeader("X-RateLimit-Reset", reset.toString())

    if (!success) {
      res.status(429).json({ error: "Too many requests. Please try again later." })
      return
    }

    next()
  } catch (error) {
    logger.error("Rate limit error:", error)
    // Fail open or fail closed? Let's fail open if Redis is down so we don't break the webhook.
    next()
  }
}
