import { BitrefillSearchResponse, SearchOptions, SearchResults } from "../types/index.js";
import { logError } from "../utils/index.js";

/**
 * Service for searching Bitrefill products
 */
export class SearchService {
  private static readonly BASE_URL = "https://www.bitrefill.com/api/omni";
  
  /**
   * Search for products by query with optional parameters
   * @param query - Search query string
   * @param options - Additional search options
   * @returns Search results
   */
  public static async search(query: string, options: Partial<SearchOptions> = {}): Promise<SearchResults> {
    try {
      const url = this.buildSearchUrl(query, options);
      const response = await fetch(url, {
        method: "GET",
        headers: this.getDefaultHeaders(),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json() as BitrefillSearchResponse;
      return this.transformApiResponse(data);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), "SearchService");
      return { results: [] };
    }
  }

  /**
   * Build the search URL with query parameters
   * @param query - Search query
   * @param options - Additional search options
   * @returns Formatted URL string
   */
  private static buildSearchUrl(query: string, options: Partial<SearchOptions>): string {
    // Start with default parameters
    const params = new URLSearchParams({
      q: query,
      limit: String(options.limit || 6),
      skip: String(options.skip || 0),
      src: 'mcp',
      col: '1',
      prefcc: '1',
    });

    // Add optional parameters if provided
    if (options.category) params.set('category', options.category);
    if (options.country) params.set('country', options.country);
    if (options.language) params.set('hl', options.language);

    return `${this.BASE_URL}?${params.toString()}`;
  }

  /**
   * Get default headers for API requests
   * @returns Headers object
   */
  private static getDefaultHeaders(): HeadersInit {
    return {
      "accept": "application/json",
      "accept-language": "en-US,en;q=0.9",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin"
    };
  }

  /**
   * Transform API response to SearchResults format
   * @param apiResponse - Raw API response
   * @returns Formatted search results
   */
  private static transformApiResponse(apiResponse: BitrefillSearchResponse): SearchResults {
    if (!apiResponse.products || !Array.isArray(apiResponse.products)) {
      return { results: [] };
    }

    return {
      results: apiResponse.products.map((product) => ({
        id: product.id,
        name: product.name,
        type: product.type || "",
        _priceRange: product._priceRange,
        _ratingValue: product._ratingValue,
        _reviewCount: product._reviewCount,
        baseName: product.baseName || "",
        billCategories: product.billCategories || [],
        cashbackDisabled: product.cashbackDisabled,
        cashbackPercentage: product.cashbackPercentage,
        cashbackPercentageFinal: product.cashbackPercentageFinal,
        categories: product.categories || [],
        countries: product.countries || [],
        countryCode: product.countryCode || "",
        currency: product.currency || "",
        isRanged: product.isRanged,
        range: product.range,
        redemptionMethods: product.redemptionMethods || [],
        slug: product.slug || "",
        usageMethods: product.usageMethods || [],
        usps: product.usps || [],
      })),
    };
  }
}
