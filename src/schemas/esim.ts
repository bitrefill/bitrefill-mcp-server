/**
 * Zod input for eSIM API
 */
import * as z from 'zod/v4';
import { PaymentMethod } from './invoice.js';
import { paymentMethods } from '../constants/payment_methods.js';

const esimLineItem = z
    .object({
        product_id: z.string().describe('eSIM product id, e.g. bitrefill-esim-europe'),
        quantity: z.number().int().positive().optional(),
        value: z
            .string()
            .optional()
            .describe('Data bundle from product packages, e.g. "3GB, 30 Days"'),
        package_id: z.string().optional().describe('Alternative to value for fixed package id'),
        esim_id: z
            .string()
            .optional()
            .describe('ICCID to top up an existing eSIM; omit for a new eSIM'),
        phone_number: z.string().optional(),
    })
    .refine(
        (d) => (d.value != null && d.value.length > 0) || d.package_id != null,
        { message: 'Each eSIM line needs `value` (bundle string) and/or `package_id`' }
    );

export const CreateEsimInvoiceInput = {
    products: z.array(esimLineItem).min(1).max(20).describe('eSIM purchase or top-up lines'),
    payment_method: PaymentMethod.default('balance').describe(
        `Payment method. One of: ${paymentMethods.join(', ')}`
    ),
    auto_pay: z.boolean().optional().describe('Pay immediately from balance when payment_method=balance'),
    webhook_url: z.url().optional(),
    email: z.string().email().optional(),
    send_email: z.boolean().optional(),
    refund_address: z.string().optional().describe('Required for non-balance crypto payments'),
};

export const CreateEsimInvoiceInputSchema = z.object(CreateEsimInvoiceInput);
export type CreateEsimInvoiceInput = z.infer<typeof CreateEsimInvoiceInputSchema>;

export const EsimListInput = {
    start: z.number().int().nonnegative().optional(),
    limit: z.number().int().positive().max(50).optional(),
    after: z.string().optional(),
    before: z.string().optional(),
};

export const EsimListInputSchema = z.object(EsimListInput);
export type EsimListInput = z.infer<typeof EsimListInputSchema>;

export const EsimProductIdInput = {
    id: z.string().describe('eSIM product id'),
};

export const EsimProductIdInputSchema = z.object(EsimProductIdInput);

export const EsimIdInput = {
    id: z.string().describe('eSIM ICCID'),
};

export const EsimIdInputSchema = z.object(EsimIdInput);

export const EsimInvoiceIdInput = {
    id: z.string().describe('eSIM purchase invoice id (UUID)'),
};

export const EsimInvoiceIdInputSchema = z.object(EsimInvoiceIdInput);
