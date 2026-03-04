"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookPaymentSchema = exports.PaymentInitiateSchema = void 0;
const zod_1 = require("zod");
exports.PaymentInitiateSchema = zod_1.z.object({
    enrollmentId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().positive(),
    method: zod_1.z.enum(['ORANGE_MONEY', 'WAVE', 'CASH', 'CHEQUE', 'BANK_TRANSFER']),
});
exports.WebhookPaymentSchema = zod_1.z.object({
    transactionId: zod_1.z.string(),
    status: zod_1.z.enum(['SUCCESS', 'FAILED']),
    amount: zod_1.z.number(),
    metadata: zod_1.z.object({
        paymentId: zod_1.z.string().uuid(),
    }),
});
