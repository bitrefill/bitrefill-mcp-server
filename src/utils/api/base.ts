/**
 * Base API client with common functionality
 */
import { logError } from "../index.js";

/**
 * Default headers for API requests
 */
export const DEFAULT_HEADERS: HeadersInit = {
  accept: "application/json",
  "accept-language": "en-US,en;q=0.9",
};

/**
 * Base API client class with common functionality
 */
export abstract class BaseApiClient {
  /**
   * Base URL for API requests
   */
  protected abstract readonly baseUrl: string;

  /**
   * Context for logging
   */
  protected abstract readonly context: string;

  /**
   * Build a query string from an object of parameters
   * @param params - Query parameters object
   * @returns Query string (including ? prefix if params exist)
   */
  protected buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';
    
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Make an API request with error handling
   * @param endpoint - API endpoint path (will be appended to baseUrl)
   * @param options - Fetch options
   * @returns Response data
   * @throws Error if the request fails
   */
  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    
    try {
      // Set default headers if not provided
      if (!options.headers) {
        options.headers = DEFAULT_HEADERS;
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      // Log the error but rethrow it for the caller to handle
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Build a complete URL from the base URL and endpoint
   * @param endpoint - API endpoint path
   * @returns Complete URL
   */
  protected buildUrl(endpoint: string): string {
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // Ensure baseUrl ends with a slash
    const baseWithSlash = this.baseUrl.endsWith('/') 
      ? this.baseUrl 
      : `${this.baseUrl}/`;
    
    return `${baseWithSlash}${cleanEndpoint}`;
  }

  /**
   * Handle and log errors
   * @param error - Error to handle
   */
  protected handleError(error: unknown): void {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      this.context
    );
  }
}
