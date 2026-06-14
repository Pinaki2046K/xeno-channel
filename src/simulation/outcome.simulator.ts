type OutcomeType = "delivered" | "opened" | "read" | "clicked" | "converted"
type Channel = "WHATSAPP" | "SMS" | "EMAIL" | "RCS"

// Probability table — industry-realistic benchmarks:
const OUTCOME_PROBABILITIES: Record<Channel, Record<OutcomeType, number>> = {
  WHATSAPP: {
    delivered: 0.92,
    opened:    0.75,   // high — WhatsApp open rates are very high
    read:      0.65,   // blue ticks
    clicked:   0.25,
    converted: 0.06
  },
  SMS: {
    delivered: 0.88,
    opened:    0.60,   // SMS open rates are still high
    read:      0.00,   // SMS doesn't have read receipts — never fire READ
    clicked:   0.15,
    converted: 0.04
  },
  EMAIL: {
    delivered: 0.80,
    opened:    0.28,   // email open rates are lower
    read:      0.00,   // email doesn't have read receipts
    clicked:   0.18,
    converted: 0.05
  },
  RCS: {
    delivered: 0.85,
    opened:    0.65,
    read:      0.55,
    clicked:   0.22,
    converted: 0.05
  }
}

export function simulateOutcome(outcome: OutcomeType, channel: Channel): boolean {
  const probability = OUTCOME_PROBABILITIES[channel][outcome]
  return Math.random() < probability
}

// Add small random variance (±5%) to prevent perfectly uniform stats
// This makes analytics look real, not simulated
export function withVariance(base: number): number {
  const variance = (Math.random() - 0.5) * 0.1
  return Math.min(1, Math.max(0, base + variance))
}
