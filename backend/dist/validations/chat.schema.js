"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAgreedPriceSchema = exports.sendMessageSchema = void 0;
const zod_1 = require("zod");
exports.sendMessageSchema = zod_1.z.object({
    content: zod_1.z
        .string({ required_error: 'Message content is required' })
        .min(1, 'Message cannot be empty')
        .max(2000, 'Message cannot exceed 2000 characters')
        .trim(),
    type: zod_1.z.enum(['text', 'payment_request', 'payment_sent']).default('text'),
    paymentAmount: zod_1.z
        .number()
        .int('Payment amount must be a whole number')
        .min(1, 'Minimum payment is 1 CampusCoin')
        .max(50000, 'Maximum payment is 50000 CampusCoins')
        .optional(),
    paymentMethod: zod_1.z
        .string()
        .max(50, 'Payment method cannot exceed 50 characters')
        .trim()
        .optional(),
});
exports.setAgreedPriceSchema = zod_1.z.object({
    price: zod_1.z
        .number({ required_error: 'Price is required' })
        .int('Price must be a whole number')
        .min(1, 'Minimum price is 1 CampusCoin')
        .max(50000, 'Maximum price is 50000 CampusCoins'),
});
//# sourceMappingURL=chat.schema.js.map