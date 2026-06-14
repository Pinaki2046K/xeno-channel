import { Router, Request, Response } from "express"
import { getQueueStats } from "../queues/message.queue"

export const healthRouter = Router()

healthRouter.get("/", async (req: Request, res: Response) => {
  try {
    const queueStats = await getQueueStats()

    res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      queueDepth: queueStats.waiting,
      processed: queueStats.completed,
      failed: queueStats.failed,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: (error as Error).message
    })
  }
})
