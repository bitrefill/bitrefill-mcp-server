/**
 * Zod input for misc API helpers
 */
import * as z from 'zod/v4';

export const CheckPhoneNumberInput = {
    phone_number: z
        .string()
        .describe('E.164 phone number, e.g. +14155551234'),
    operator: z
        .string()
        .optional()
        .describe('Optional operator hint if known'),
};

export const CheckPhoneNumberInputSchema = z.object(CheckPhoneNumberInput);
export type CheckPhoneNumberInput = z.infer<typeof CheckPhoneNumberInputSchema>;
