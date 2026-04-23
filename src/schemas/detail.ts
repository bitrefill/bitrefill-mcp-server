/**
 * Zod input for product detail by id
 */
import * as z from 'zod/v4';

export const ProductIdInput = {
    id: z.string().describe('Product id / slug from search or catalog'),
};

export const ProductIdInputSchema = z.object(ProductIdInput);
export type ProductIdType = z.infer<typeof ProductIdInputSchema>;
