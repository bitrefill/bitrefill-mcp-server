/**
 * API utility functions for Bitrefill MCP server
 */
import { logError } from "./index.js";

/**
 * Default headers for API requests
 */
export const DEFAULT_HEADERS: HeadersInit = {
  accept: "application/json",
  "accept-language": "en-US,en;q=0.9",
};

/**
 * Make an API request with error handling
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @param context - Logging context
 * @returns Response data
 * @throws Error if the request fails
 */
export async function makeApiRequest<T>(
  url: string,
  options: RequestInit = {},
  context = "API"
): Promise<T> {
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
    logError(
      error instanceof Error ? error : new Error(String(error)),
      context
    );
    throw error;
  }
}
