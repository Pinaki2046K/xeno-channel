import { Queue } from "bullmq"
import { Redis } from "ioredis"

const connection = new Redis(process.env.REDIS_URL!, {
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: null    // required for BullMQ
})

export const messageQueue = new Queue("aria-messages", {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100,    // keep last 100 completed jobs for debugging
    removeOnFail: 500         // keep last 500 failed jobs
  }
})

// Export queue stats helper:
export async function getQueueStats() {
  const [waiting, active, completed, failed] = await Promise.all([
    messageQueue.getWaitingCount(),
    messageQueue.getActiveCount(),
    messageQueue.getCompletedCount(),
    messageQueue.getFailedCount()
  ])
  return { waiting, active, completed, failed }
}

export { connection }
