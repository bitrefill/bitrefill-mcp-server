import { CreateInvoiceRequest, InvoiceResponse } from "../schemas/invoice.js";
import { authenticatedApiClient } from "../utils/api/authenticated.js";

/**
 * Service for invoice operations
 * Uses the AuthenticatedApiClient for API requests
 */
export class InvoiceService {
  /**
   * Check if the invoice service is available (API key is set)
   * @returns True if the service is available, false otherwise
   */
  public static isAvailable(): boolean {
    return authenticatedApiClient.isAvailable();
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
    return authenticatedApiClient.createInvoice(request);
  }
}
