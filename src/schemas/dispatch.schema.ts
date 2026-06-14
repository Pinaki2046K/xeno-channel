import { z } from "zod"

export const DispatchPayloadSchema = z.object({
  jobId: z.string().min(1),         // unique ID for this batch
  campaignId: z.string().min(1),
  channel: z.enum(["WHATSAPP", "SMS", "EMAIL", "RCS"]),
  messages: z.array(z.object({
    communicationId: z.string().min(1),   // ARIA's Communication record ID
    recipient: z.string().min(1),         // phone or email
    message: z.string().min(1).max(2000),
    variant: z.enum(["A", "B"]).optional()
  })).min(1).max(500)
})

export type DispatchPayload = z.infer<typeof DispatchPayloadSchema>
