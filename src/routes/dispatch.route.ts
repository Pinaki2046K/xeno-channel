import { Router, Request, Response } from "express"
import { validateChannelSecret } from "../middleware/secret.middleware"
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware"
import { DispatchPayloadSchema } from "../schemas/dispatch.schema"
import { messageQueue } from "../queues/message.queue"
import { logger } from "../utils/logger"

export const dispatchRouter = Router()

dispatchRouter.post("/", rateLimitMiddleware, validateChannelSecret, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = DispatchPayloadSchema.safeParse(req.body)

    if (!result.success) {
      logger.warn(`Invalid payload: ${JSON.stringify(result.error.issues)}`)
      res.status(400).json({ error: "Invalid payload", issues: result.error.issues })
      return
    }

    const { jobId, campaignId, channel, messages } = result.data

    // Add jobs to BullMQ queue
    const jobs = messages.map(msg => ({
      name: "process-message",
      data: {
        communicationId: msg.communicationId,
        recipient: msg.recipient,
        message: msg.message,
        channel,
        variant: msg.variant,
        campaignId
      }
    }))

    await messageQueue.addBulk(jobs)

    // Return 200 immediately
    res.status(200).json({
      jobId,
      queued: messages.length,
      status: "accepted"
    })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})
