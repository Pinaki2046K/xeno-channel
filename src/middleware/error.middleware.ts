import { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error(`Error processing request: ${err.message}`, { stack: err.stack })
  res.status(500).json({ error: "Internal server error" })
}
