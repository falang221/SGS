import { z } from 'zod';

export const PaymentInitiateSchema = z.object({
  enrollmentId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(['ORANGE_MONEY', 'WAVE', 'CASH', 'CHEQUE', 'BANK_TRANSFER']),
});

export const WebhookPaymentSchema = z.object({
  transactionId: z.string(),
  status: z.enum(['SUCCESS', 'FAILED']),
  amount: z.number(),
  metadata: z.object({
    paymentId: z.string().uuid(),
  }),
});
