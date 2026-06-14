import { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

export function validateChannelSecret(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = req.headers["x-channel-secret"]
  const expected = process.env.CHANNEL_SERVICE_SECRET

  // If CHANNEL_SERVICE_SECRET is not set in env → reject always
  // Never run open in production unlike ARIA's dev fallback
  if (!expected) {
    logger.warn("Channel service misconfigured — secret not set")
    res.status(500).json({ error: "Channel service misconfigured — secret not set" })
    return
  }

  if (!secret || secret !== expected) {
    logger.warn(`Invalid or missing channel secret. Expected: ${expected}, Got: ${secret}`)
    res.status(401).json({ error: "Invalid or missing channel secret" })
    return
  }

  next()
}
