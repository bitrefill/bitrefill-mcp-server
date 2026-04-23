/**
 * Zod input for product search / list (v2)
 */
import * as z from 'zod/v4';

/**
 * `q` is optional: when omitted, uses GET /products with filters; when set, GET /products/search
 */
export const SearchProductsInput = {
    q: z
        .string()
        .min(1)
        .max(100)
        .optional()
        .describe('Search query (1–100 chars). Omit to browse with country/category filters only'),
    country: z
        .string()
        .optional()
        .describe('ISO 3166-1 alpha-2 country code(s), comma-separated (e.g. US,IT or XI for international)'),
    category: z
        .string()
        .optional()
        .describe('Category slug(s), comma-separated — see product-categories resource'),
    start: z.number().int().nonnegative().optional().describe('Pagination start (default 0)'),
    limit: z
        .number()
        .int()
        .positive()
        .max(50)
        .optional()
        .describe('Page size (max 50)'),
    include_test_products: z
        .boolean()
        .optional()
        .describe('Include test products in results'),
};

export const SearchProductsInputSchema = z.object(SearchProductsInput);
export type SearchProductsInput = z.infer<typeof SearchProductsInputSchema>;
