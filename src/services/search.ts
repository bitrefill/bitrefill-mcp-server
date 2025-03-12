import { BitrefillSearchResponse, SearchOptions, SearchResults } from "../types/index.js";
import { logError } from "../utils/index.js";

/**
 * Service for searching Bitrefill products
 */
export class SearchService {
  private static readonly BASE_URL = "https://www.bitrefill.com/api/omni";
  private static readonly WEBSITE_BASE_URL = "https://www.bitrefill.com";
  
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
      return this.transformApiResponse(data, options);
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
   * Generate product URL based on product data and search options
   * Format: {country}/{language}/{type}/{id}
   * @param product - Product data
   * @param options - Search options
   * @returns Product URL
   */
  private static generateProductUrl(product: any, options: Partial<SearchOptions> = {}): string {
    // Default values
    const country = product.countryCode?.toLowerCase() || options.country?.toLowerCase() || 'us';
    const language = options.language?.toLowerCase() || 'en';
    const type = product.type?.toLowerCase() || 'gift-cards';
    const slug = product.slug || product.id;

    return `${this.WEBSITE_BASE_URL}/${country}/${language}/${type}/${slug}/`;
  }

  /**
   * Transform API response to SearchResults format
   * @param apiResponse - Raw API response
   * @param options - Search options used for the request
   * @returns Formatted search results
   */
  private static transformApiResponse(apiResponse: BitrefillSearchResponse, options: Partial<SearchOptions> = {}): SearchResults {
    if (!apiResponse.products || !Array.isArray(apiResponse.products)) {
      return { results: [] };
    }

    return {
      results: apiResponse.products.map((product) => ({
        id: product.id,
        name: product.name,
        type: product.type || "",
        url: this.generateProductUrl(product, options),
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
