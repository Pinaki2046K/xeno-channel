type Channel = "WHATSAPP" | "SMS" | "EMAIL" | "RCS"
type DelayConfig = { min: number; max: number }

const DELIVERY_DELAYS: Record<Channel, DelayConfig> = {
  WHATSAPP: { min: 300,  max: 1500  },  // fast — near instant
  SMS:      { min: 500,  max: 3000  },  // slightly slower
  EMAIL:    { min: 1000, max: 5000  },  // slower — SMTP relay
  RCS:      { min: 400,  max: 2000  }
}

const ENGAGEMENT_DELAYS: Record<Channel, DelayConfig> = {
  WHATSAPP: { min: 5000,  max: 30000  },  // people open WhatsApp quickly
  SMS:      { min: 10000, max: 60000  },  // open within a minute usually
  EMAIL:    { min: 30000, max: 300000 },  // emails sit longer before opened
  RCS:      { min: 8000,  max: 45000  }
}

export function getDeliveryDelay(channel: Channel): number {
  const { min, max } = DELIVERY_DELAYS[channel]
  return randomDelay(min, max)
}

export function getEngagementDelay(channel: Channel): number {
  const { min, max } = ENGAGEMENT_DELAYS[channel]
  return randomDelay(min, max)
}

export function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
