/**
 * Authenticated API client for Bitrefill endpoints that require API key authentication
 */
import { 
  CreateInvoiceRequest, 
  InvoiceResponse, 
  InvoiceListOptions, 
  InvoiceListResponse,
  InvoiceDetailResponse,
  PayInvoiceResponse 
} from "../../schemas/invoice.js";
import {
  OrderListOptions,
  OrderListResponse,
  OrderDetailResponse,
  UnsealedOrderResponse
} from "../../schemas/order.js";
import {
  PingResponse,
  AccountBalanceResponse,
  CheckPhoneNumberOptions,
} from "../../schemas/misc.js";
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
   * Get a list of invoices
   * @param options - Options for filtering invoices
   * @returns List of invoices
   * @throws Error if the API request fails or if the API key is not set
   */
  public async getInvoices(options?: InvoiceListOptions): Promise<InvoiceListResponse> {
    if (!this.isAvailable()) {
      const error = new Error("API credentials not configured");
      this.handleError(error);
      throw error;
    }

    return this.makeRequest<InvoiceListResponse>(
      `invoices${this.buildQueryString(options)}`,
      {
        method: "GET",
        headers: {
          ...DEFAULT_HEADERS,
          authorization: this.getAuthHeader(),
        },
      }
    );
  }

  /**
   * Get an invoice by ID
   * @param id - Invoice ID
   * @returns Invoice details
   * @throws Error if the API request fails or if the API key is not set
   */
  public async getInvoiceById(id: string): Promise<InvoiceDetailResponse> {
    if (!this.isAvailable()) {
      const error = new Error("API credentials not configured");
      this.handleError(error);
      throw error;
    }

    return this.makeRequest<InvoiceDetailResponse>(
      `invoices/${id}`,
      {
        method: "GET",
        headers: {
          ...DEFAULT_HEADERS,
          authorization: this.getAuthHeader(),
        },
      }
    );
  }

  /**
   * Pay an invoice
   * @param id - Invoice ID
   * @returns Payment result
   * @throws Error if the API request fails or if the API key is not set
   */
  public async payInvoice(id: string): Promise<PayInvoiceResponse> {
    if (!this.isAvailable()) {
      const error = new Error("API credentials not configured");
      this.handleError(error);
      throw error;
    }

    return this.makeRequest<PayInvoiceResponse>(
      `invoices/${id}/pay`,
      {
        method: "POST",
        headers: {
          ...DEFAULT_HEADERS,
          authorization: this.getAuthHeader(),
        },
      }
    );
  }

  /**
   * Get a list of orders
   * @param options - Options for filtering orders
   * @returns List of orders
   * @throws Error if the API request fails or if the API key is not set
   */
  public async getOrders(options?: OrderListOptions): Promise<OrderListResponse> {
    if (!this.isAvailable()) {
      const error = new Error("API credentials not configured");
      this.handleError(error);
      throw error;
    }

    return this.makeRequest<OrderListResponse>(
      `orders${this.buildQueryString(options)}`,
      {
        method: "GET",
        headers: {
          ...DEFAULT_HEADERS,
          authorization: this.getAuthHeader(),
        },
      }
    );
  }

  /**
   * Get an order by ID
   * @param id - Order ID
   * @returns Order details
   * @throws Error if the API request fails or if the API key is not set
   */
  public async getOrderById(id: string): Promise<OrderDetailResponse> {
    if (!this.isAvailable()) {
      const error = new Error("API credentials not configured");
      this.handleError(error);
      throw error;
    }

    return this.makeRequest<OrderDetailResponse>(
      `orders/${id}`,
      {
        method: "GET",
        headers: {
          ...DEFAULT_HEADERS,
          authorization: this.getAuthHeader(),
        },
      }
    );
  }

  /**
   * Unseal an order by ID to reveal codes and PINs
   * @param id - Order ID
   * @returns Unsealed order details
   * @throws Error if the API request fails or if the API key is not set
   */
  public async unsealOrder(id: string): Promise<UnsealedOrderResponse> {
    if (!this.isAvailable()) {
      const error = new Error("API credentials not configured");
      this.handleError(error);
      throw error;
    }

    return this.makeRequest<UnsealedOrderResponse>(
      `orders/${id}/unseal`,
      {
        method: "GET",
        headers: {
          ...DEFAULT_HEADERS,
          authorization: this.getAuthHeader(),
        },
      }
    );
  }

  /**
   * Ping the API to check if it's available
   * @returns Ping response
   */
  public async ping(): Promise<PingResponse> {
    return this.makeRequest<PingResponse>(
      "ping",
      {
        method: "GET",
        headers: DEFAULT_HEADERS,
      }
    );
  }

  /**
   * Get account balance
   * @returns Account balance
   * @throws Error if the API request fails or if the API key is not set
   */
  public async getAccountBalance(): Promise<AccountBalanceResponse> {
    if (!this.isAvailable()) {
      const error = new Error("API credentials not configured");
      this.handleError(error);
      throw error;
    }

    return this.makeRequest<AccountBalanceResponse>(
      "accounts/balance",
      {
        method: "GET",
        headers: {
          ...DEFAULT_HEADERS,
          authorization: this.getAuthHeader(),
        },
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
