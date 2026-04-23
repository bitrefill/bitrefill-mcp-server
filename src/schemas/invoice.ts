/**
 * Zod input schemas for Bitrefill invoice API
 */
import * as z from 'zod/v4';
import { paymentMethodEnum, paymentMethods } from '../constants/payment_methods.js';

export const PaymentMethod = z.enum(paymentMethodEnum);

const invoiceLineItem = z
    .object({
        product_id: z.string().describe('Product slug / ID from the catalog'),
        quantity: z.number().int().positive().optional().describe('Line quantity (default 1)'),
        value: z
            .union([z.number(), z.string()])
            .optional()
            .describe('For ranged or test products: amount or label (e.g. package value)'),
        package_id: z
            .string()
            .optional()
            .describe('Fixed-denomination package id, e.g. product-id<&>50'),
        phone_number: z.string().optional().describe('E.164 for phone top-ups'),
        esim_id: z.string().optional().describe('ICCID for eSIM top-ups (use create-esim-invoice for eSIM)'),
    })
    .refine((d) => d.value !== undefined || d.package_id !== undefined, {
        message: 'Each product line must include either `value` or `package_id`',
    });

export const BuyProductsInput = {
    products: z
        .array(invoiceLineItem)
        .min(1)
        .max(20)
        .describe('Products to purchase (max 20 lines)'),
    payment_method: PaymentMethod.default('balance').describe(
        `Payment method. One of: ${paymentMethods.join(', ')}`
    ),
    auto_pay: z
        .boolean()
        .optional()
        .describe('Only with payment_method=balance: pay immediately from account balance'),
    webhook_url: z
        .url()
        .optional()
        .describe('URL for final-state invoice webhooks'),
    email: z.string().email().optional().describe('Receipt email'),
    send_email: z.boolean().optional().describe('Send purchase email'),
    refund_address: z
        .string()
        .optional()
        .describe('Required for crypto payment methods: refund address'),
};

export const BuyProductsInputSchema = z.object(BuyProductsInput);
export type BuyProductsInput = z.infer<typeof BuyProductsInputSchema>;

export const InvoiceListInput = {
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

export const InvoiceListInputSchema = z.object(InvoiceListInput);
export type InvoiceListInput = z.infer<typeof InvoiceListInputSchema>;

export const InvoiceIdInput = {
    id: z.string().describe('Invoice UUID'),
};

export const InvoiceIdInputSchema = z.object(InvoiceIdInput);
export type InvoiceIdType = z.infer<typeof InvoiceIdInputSchema>;
