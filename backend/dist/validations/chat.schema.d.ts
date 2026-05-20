import { z } from 'zod';
export declare const sendMessageSchema: z.ZodObject<{
    content: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["text", "payment_request", "payment_sent"]>>;
    paymentAmount: z.ZodOptional<z.ZodNumber>;
    paymentMethod: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "text" | "payment_request" | "payment_sent";
    content: string;
    paymentAmount?: number | undefined;
    paymentMethod?: string | undefined;
}, {
    content: string;
    type?: "text" | "payment_request" | "payment_sent" | undefined;
    paymentAmount?: number | undefined;
    paymentMethod?: string | undefined;
}>;
export declare const setAgreedPriceSchema: z.ZodObject<{
    price: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    price: number;
}, {
    price: number;
}>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type SetAgreedPriceInput = z.infer<typeof setAgreedPriceSchema>;
//# sourceMappingURL=chat.schema.d.ts.map