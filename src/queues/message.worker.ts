import { Worker, Job } from "bullmq"
import { connection } from "./message.queue"
import { logger } from "../utils/logger"
import { sendCallback } from "../callbacks/callback.sender"
import { getDeliveryDelay, getEngagementDelay, randomDelay, sleep } from "../simulation/delay.simulator"
import { simulateOutcome } from "../simulation/outcome.simulator"

// Process MAX_CONCURRENCY jobs simultaneously (default 50)
export const worker = new Worker("aria-messages", async (job: Job) => {
  const { communicationId, channel, variant } = job.data

  // Step 1: Simulate initial "SENT" status immediately
  await sendCallback(communicationId, "SENT")

  // Step 2: Wait for channel-specific delivery delay
  await sleep(getDeliveryDelay(channel))

  // Step 3: Determine delivery outcome
  const delivered = simulateOutcome("delivered", channel)

  if (!delivered) {
    await sendCallback(communicationId, "FAILED")
    return
  }

  await sendCallback(communicationId, "DELIVERED")

  // Step 4: Simulate engagement chain (each with its own delay)
  // Only fire subsequent callbacks probabilistically
  await sleep(getEngagementDelay(channel))

  const opened = simulateOutcome("opened", channel)
  if (!opened) return
  await sendCallback(communicationId, "OPENED")

  await sleep(randomDelay(2000, 8000))

  const read = simulateOutcome("read", channel)
  if (read && channel === "WHATSAPP") {
    await sendCallback(communicationId, "READ")
    await sleep(randomDelay(1000, 5000))
  }

  const clicked = simulateOutcome("clicked", channel)
  if (!clicked) return
  await sendCallback(communicationId, "CLICKED")

  await sleep(randomDelay(3000, 15000))

  const converted = simulateOutcome("converted", channel)
  if (converted) {
    await sendCallback(communicationId, "CONVERTED")
  }

}, {
  connection: connection as any,
  concurrency: Number(process.env.MAX_CONCURRENCY) || 50
})

worker.on("failed", (job, err) => {
  logger.error(`Job ${job?.id} failed: ${err.message}`)
})

worker.on("completed", (job) => {
  logger.info(`Job ${job.id} completed for communicationId: ${job.data.communicationId}`)
})
