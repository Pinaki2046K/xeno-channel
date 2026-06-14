import { logger } from "../utils/logger"
import { sleep } from "../simulation/delay.simulator"

interface CallbackPayload {
  communicationId: string
  status: "SENT" | "DELIVERED" | "FAILED" | "OPENED" | "READ" | "CLICKED" | "CONVERTED"
  timestamp: string
}

export async function sendCallback(
  communicationId: string,
  status: CallbackPayload["status"]
): Promise<void> {
  const payload: CallbackPayload = {
    communicationId,
    status,
    timestamp: new Date().toISOString()
  }

  const maxAttempts = Number(process.env.RETRY_ATTEMPTS) || 3
  const retryDelay = Number(process.env.RETRY_DELAY_MS) || 2000

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `${process.env.ARIA_CALLBACK_URL}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-channel-secret": process.env.CHANNEL_SERVICE_SECRET!
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(5000)   // 5s timeout per attempt
        }
      )

      if (response.ok) {
        logger.info(`Callback sent: ${communicationId} → ${status}`)
        return
      }

      // ARIA returned a non-2xx — log but don't retry on 4xx (bad payload)
      if (response.status >= 400 && response.status < 500) {
        logger.warn(`Callback rejected by ARIA (${response.status}): ${communicationId} → ${status}`)
        return
      }

      // 5xx — retry
      throw new Error(`ARIA returned ${response.status}`)

    } catch (err) {
      logger.warn(`Callback attempt ${attempt}/${maxAttempts} failed for ${communicationId}: ${(err as Error).message}`)

      if (attempt < maxAttempts) {
        // Exponential backoff: 2s, 4s, 8s
        await sleep(retryDelay * Math.pow(2, attempt - 1))
      } else {
        logger.error(`All ${maxAttempts} callback attempts failed for ${communicationId} → ${status}`)
        // Don't throw — a failed callback should not crash the worker
      }
    }
  }
}
