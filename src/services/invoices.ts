import { CreateInvoiceRequest, InvoiceResponse } from "../schemas/invoice.js";
import { makeApiRequest } from "../utils/api.js";
import { logError } from "../utils/index.js";

/**
 * Service for invoice operations
 */
export class InvoiceService {
  private static readonly BASE_URL = "https://api.bitrefill.com/v2";

  /**
   * Check if the invoice service is available (API key is set)
   * @returns True if the service is available, false otherwise
   */
  public static isAvailable(): boolean {
    return (!!process.env.BITREFILL_API_SECRET && !!process.env.BITREFILL_API_ID) || !!process.env.BITREFILL_API_TOKEN;
  }

  /**
   * Create a new invoice
   * @param request - Invoice creation request
   * @returns Invoice response
   * @throws Error if the API request fails or if the API key is not set
   */
  public static async createInvoice(
    request: CreateInvoiceRequest
  ): Promise<InvoiceResponse> {
    const url = `${this.BASE_URL}/invoices`;

    try {
      // Get API authentication credentials from environment variables
      const apiSecret = process.env.BITREFILL_API_SECRET;
      const apiId = process.env.BITREFILL_API_ID;
      const apiToken = process.env.BITREFILL_API_TOKEN;

      if (!((apiSecret && apiId) || apiToken)) {
        throw new Error("Either BITREFILL_API_SECRET and BITREFILL_API_ID or BITREFILL_API_TOKEN environment variables must be set");
      }

      // Create authentication header based on available credentials:
      // Use Basic Auth if both secret and id are provided; otherwise, use Bearer token.
      const authHeader = (apiSecret && apiId)
        ? `Basic ${Buffer.from(`${apiId}:${apiSecret}`).toString("base64")}`
        : `Basic ${apiToken}`;

      // Make the actual API request
      return makeApiRequest<InvoiceResponse>(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: authHeader,
          },
          body: JSON.stringify(request),
        },
        "InvoiceService"
      );
    } catch (error: unknown) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        "InvoiceService"
      );
      throw error;
    }
  }
}
