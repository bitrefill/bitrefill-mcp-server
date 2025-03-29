import {
  SearchOptionsSchema,
  SearchOptionsType,
  SearchResults,
} from "../schemas/search.js";
import { publicApiClient } from "../utils/api/public.js";

/**
 * Service for searching Bitrefill products
 * Uses the PublicApiClient for API requests
 */
export class SearchService {
  /**
   * Search for products by query with optional parameters
   * @param query - Search query string
   * @param options - Additional search options
   * @returns Search results
   */
  public static async search(
    query: string,
    options: Partial<SearchOptionsType> = {}
  ): Promise<SearchResults> {
    // Validate options
    const validatedOptions = SearchOptionsSchema.parse(options);
    
    // Use the public API client to perform the search
    return publicApiClient.search(query, validatedOptions);
  }
}
