/**
 * Zod input schemas for Bitrefill order API
 */
import * as z from 'zod/v4';

export const OrderListInput = {
    start: z.number().int().nonnegative().optional().describe('Pagination start (default 0)'),
    limit: z
        .number()
        .int()
        .positive()
        .max(50)
        .optional()
        .describe('Page size (max 50)'),
    after: z
        .string()
        .optional()
        .describe('Inclusive start date filter: YYYY-MM-DD HH:MM:SS'),
    before: z
        .string()
        .optional()
        .describe('Non-inclusive end date filter: YYYY-MM-DD HH:MM:SS'),
};

export const OrderListInputSchema = z.object(OrderListInput);
export type OrderListInput = z.infer<typeof OrderListInputSchema>;

export const OrderIdInput = {
    id: z.string().describe('Order ID'),
};

export const OrderIdInputSchema = z.object(OrderIdInput);
export type OrderIdType = z.infer<typeof OrderIdInputSchema>;
