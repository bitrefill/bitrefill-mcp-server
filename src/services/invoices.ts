import { 
  CreateInvoiceRequest, 
  InvoiceResponse, 
  InvoiceListOptions, 
  InvoiceListResponse,
  InvoiceDetailResponse,
  PayInvoiceResponse 
} from "../schemas/invoice.js";
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

  /**
   * Get a list of invoices
   * @param options - Options for filtering invoices
   * @returns List of invoices
   * @throws Error if the API request fails or if the API key is not set
   */
  public static async getInvoices(options?: InvoiceListOptions): Promise<InvoiceListResponse> {
    return authenticatedApiClient.getInvoices(options);
  }

  /**
   * Get invoice details by ID
   * @param id - Invoice ID
   * @returns Invoice details
   * @throws Error if the API request fails or if the API key is not set
   */
  public static async getInvoiceById(id: string): Promise<InvoiceDetailResponse> {
    return authenticatedApiClient.getInvoiceById(id);
  }

  /**
   * Pay an invoice
   * @param id - Invoice ID
   * @returns Payment result
   * @throws Error if the API request fails or if the API key is not set
   */
  public static async payInvoice(id: string): Promise<PayInvoiceResponse> {
    return authenticatedApiClient.payInvoice(id);
  }
}
