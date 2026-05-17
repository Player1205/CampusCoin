import { z } from 'zod';

// ─── Send Message ─────────────────────────────────────────────────────────────

export const sendMessageSchema = z.object({
  content: z
    .string({ required_error: 'Message content is required' })
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters')
    .trim(),

  type: z.enum(['text', 'payment_request', 'payment_sent']).default('text'),

  paymentAmount: z
    .number()
    .int('Payment amount must be a whole number')
    .min(1, 'Minimum payment is 1 CampusCoin')
    .max(50000, 'Maximum payment is 50000 CampusCoins')
    .optional(),

  paymentMethod: z
    .string()
    .max(50, 'Payment method cannot exceed 50 characters')
    .trim()
    .optional(),
});

// ─── Set Agreed Price ─────────────────────────────────────────────────────────

export const setAgreedPriceSchema = z.object({
  price: z
    .number({ required_error: 'Price is required' })
    .int('Price must be a whole number')
    .min(1, 'Minimum price is 1 CampusCoin')
    .max(50000, 'Maximum price is 50000 CampusCoins'),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type SetAgreedPriceInput = z.infer<typeof setAgreedPriceSchema>;
