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
    return !!process.env.BITREFILL_API_SECRET && !!process.env.BITREFILL_API_ID;
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
      // Get API key from environment variable
      const apiSecret = process.env.BITREFILL_API_SECRET;
      const apiId = process.env.BITREFILL_API_ID;
      
      if (!apiSecret || !apiId) {
        throw new Error("BITREFILL_API_SECRET and BITREFILL_API_ID environment variables are not set");
      }
      
      // Make the actual API request
      return makeApiRequest<InvoiceResponse>(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${Buffer.from(`${apiId}:${apiSecret}`).toString('base64')}`
        },
        body: JSON.stringify(request)
      }, "InvoiceService");
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), "InvoiceService");
      throw error;
    }
  }
}
