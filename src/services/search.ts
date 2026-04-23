import { SearchProductsInputSchema, type SearchProductsInput } from '../schemas/search.js';
import { authenticatedApiClient } from '../utils/api/authenticated.js';
import type { ListEnvelope, Product } from '../types/api.js';

/**
 * Product search (GET /v2/products/search) or browse (GET /v2/products)
 */
export class SearchService {
    public static async searchProducts(
        input: SearchProductsInput
    ): Promise<ListEnvelope<Product[]>> {
        const parsed = SearchProductsInputSchema.parse(input);
        const q = parsed.q?.trim();

        if (q) {
            return authenticatedApiClient.searchProducts({
                ...parsed,
                q,
            });
        }

        return authenticatedApiClient.getProducts(parsed);
    }
}
