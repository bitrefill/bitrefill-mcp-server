/**
 * Authenticated API client for Bitrefill endpoints that require API key authentication
 */
import { CreateInvoiceRequest, InvoiceResponse } from "../../schemas/invoice.js";
import { BaseApiClient, DEFAULT_HEADERS } from "./base.js";

/**
 * Client for authenticated Bitrefill API endpoints (invoice creation, etc.)
 */
export class AuthenticatedApiClient extends BaseApiClient {
  /**
   * Base URL for authenticated API endpoints
   */
  protected readonly baseUrl = "https://api.bitrefill.com/v2";
  
  /**
   * Context for logging
   */
  protected readonly context = "AuthenticatedApiClient";

  /**
   * Check if the client is properly configured with API credentials
   * @returns True if the client is available, false otherwise
   */
  public isAvailable(): boolean {
    return (!!process.env.BITREFILL_API_SECRET && !!process.env.BITREFILL_API_ID);
  }

  /**
   * Create a new invoice
   * @param request - Invoice creation request
   * @returns Invoice response
   * @throws Error if the API request fails or if the API key is not set
   */
  public async createInvoice(
    request: CreateInvoiceRequest
  ): Promise<InvoiceResponse> {
    if (!this.isAvailable()) {
      const error = new Error("API credentials not configured. BITREFILL_API_SECRET and BITREFILL_API_ID environment variables must be set");
      this.handleError(error);
      throw error;
    }

    return this.makeRequest<InvoiceResponse>(
      "invoices",
      {
        method: "POST",
        headers: {
          ...DEFAULT_HEADERS,
          "Content-Type": "application/json",
          authorization: this.getAuthHeader(),
        },
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Get the appropriate authentication header based on available credentials
   * @returns Authentication header string
   * @throws Error if required credentials are not available
   */
  private getAuthHeader(): string {
    const apiSecret = process.env.BITREFILL_API_SECRET;
    const apiId = process.env.BITREFILL_API_ID;

    if (apiSecret && apiId) {
      // Use Basic Auth if both secret and id are provided
      return `Basic ${Buffer.from(`${apiId}:${apiSecret}`).toString("base64")}`;
    } else {
      throw new Error("API credentials not configured. BITREFILL_API_ID or BITREFILL_API_TOKEN environment variables must be set");
    }
  }
}

// Export singleton instance
export const authenticatedApiClient = new AuthenticatedApiClient();
