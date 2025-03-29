/**
 * Public API client for Bitrefill endpoints that don't require authentication
 */
import { ProductDetailResponse } from "../../schemas/detail.js";
import {
  BitrefillSearchResponse,
  SearchOptionsType,
  SearchResults,
} from "../../schemas/search.js";
import { BaseApiClient } from "./base.js";

/**
 * Client for public Bitrefill API endpoints (search and product details)
 */
export class PublicApiClient extends BaseApiClient {
  /**
   * Base URL for public API endpoints
   */
  protected readonly baseUrl = "https://www.bitrefill.com/api";
  
  /**
   * Context for logging
   */
  protected readonly context = "PublicApiClient";

  /**
   * Website base URL for generating product URLs
   */
  private readonly websiteBaseUrl = "https://www.bitrefill.com";

  /**
   * Search for products by query with optional parameters
   * @param query - Search query string
   * @param options - Additional search options
   * @returns Search results
   */
  public async search(
    query: string,
    options: Partial<SearchOptionsType> = {}
  ): Promise<SearchResults> {
    // Build query parameters
    const params = new URLSearchParams({
      q: query,
      limit: String(options.limit || 25),
      skip: String(options.skip || 0),
      src: "mcp",
      col: "1",
      prefcc: "1",
    });

    // Add optional parameters if provided
    if (options.category) params.set("category", options.category);
    if (options.country) params.set("country", options.country);
    if (options.language) params.set("hl", options.language);
    
    // Use the endpoint with query parameters
    const endpoint = `omni?${params.toString()}`;
    
    const data = await this.makeRequest<BitrefillSearchResponse>(
      endpoint,
      { method: "GET" }
    );
    
    return this.transformApiResponse(data, options);
  }

  /**
   * Get product details by ID
   * @param id - Product ID
   * @returns ProductDetailResponse with complete product details
   * @throws Error if the API request fails
   */
  public async getProductDetails(id: string): Promise<ProductDetailResponse> {
    return this.makeRequest<ProductDetailResponse>(`product/${id}`, {
      method: "GET",
    });
  }


  /**
   * Generate product URL based on product data and search options
   * Format: {country}/{language}/{type}/{id}
   * @param product - Product data
   * @param options - Search options
   * @returns Product URL
   */
  private generateProductUrl(
    product: any,
    options: Partial<SearchOptionsType> = {}
  ): string {
    // Default values
    const country =
      product.countryCode?.toLowerCase() ||
      options.country?.toLowerCase() ||
      "us";
    const language = options.language?.toLowerCase() || "en";
    const type = product.type?.toLowerCase() || "gift-cards";
    const slug = product.slug || product.id;

    return `${this.websiteBaseUrl}/${country}/${language}/${type}/${slug}/`;
  }

  /**
   * Transform API response to SearchResults format
   * @param apiResponse - Raw API response
   * @param options - Search options used for the request
   * @returns Formatted search results
   */
  private transformApiResponse(
    apiResponse: BitrefillSearchResponse,
    options: Partial<SearchOptionsType> = {}
  ): SearchResults {
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

// Export singleton instance
export const publicApiClient = new PublicApiClient();
