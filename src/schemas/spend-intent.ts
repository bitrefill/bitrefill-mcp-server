/**
 * Zod input for high-level spend intent resolution.
 */
import * as z from 'zod/v4';

export const ResolveSpendIntentInput = {
    intent: z
        .string()
        .min(3)
        .max(2000)
        .describe(
            'Natural-language user goal, e.g. "I am travelling to Germany, plan what I need"'
        ),
    country: z
        .string()
        .min(2)
        .max(80)
        .optional()
        .describe(
            'Destination or purchase country as ISO alpha-2 code or country name. If omitted, the tool tries to infer it from intent.'
        ),
    city: z
        .string()
        .min(1)
        .max(120)
        .optional()
        .describe('Destination or purchase city, used only as context for routing.'),
    trip_start: z
        .string()
        .optional()
        .describe('Optional trip start date as YYYY-MM-DD.'),
    trip_end: z
        .string()
        .optional()
        .describe('Optional trip end date as YYYY-MM-DD.'),
    budget: z
        .number()
        .positive()
        .optional()
        .describe('Optional total budget for the user goal. This tool does not purchase.'),
    currency: z
        .string()
        .length(3)
        .optional()
        .describe('Optional ISO 4217 currency code for budget context.'),
    max_results_per_need: z
        .number()
        .int()
        .positive()
        .max(8)
        .default(4)
        .describe('Maximum product candidates returned for each detected need.'),
    include_test_products: z
        .boolean()
        .optional()
        .describe('Include Bitrefill test products in candidate searches.'),
};

export const ResolveSpendIntentInputSchema = z.object(ResolveSpendIntentInput);
export type ResolveSpendIntentInput = z.infer<typeof ResolveSpendIntentInputSchema>;
