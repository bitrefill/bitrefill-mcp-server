import {
  OrderListOptions,
  OrderListResponse,
  OrderDetailResponse,
  UnsealedOrderResponse
} from "../schemas/order.js";
import { authenticatedApiClient } from "../utils/api/authenticated.js";

/**
 * Service for order operations
 * Uses the AuthenticatedApiClient for API requests
 */
export class OrderService {
  /**
   * Check if the order service is available (API key is set)
   * @returns True if the service is available, false otherwise
   */
  public static isAvailable(): boolean {
    return authenticatedApiClient.isAvailable();
  }

  /**
   * Get a list of orders
   * @param options - Options for filtering orders
   * @returns List of orders
   * @throws Error if the API request fails or if the API key is not set
   */
  public static async getOrders(options?: OrderListOptions): Promise<OrderListResponse> {
    return authenticatedApiClient.getOrders(options);
  }

  /**
   * Get order details by ID
   * @param id - Order ID
   * @returns Order details
   * @throws Error if the API request fails or if the API key is not set
   */
  public static async getOrderById(id: string): Promise<OrderDetailResponse> {
    return authenticatedApiClient.getOrderById(id);
  }

  /**
   * Unseal an order to reveal codes and PINs
   * @param id - Order ID
   * @returns Unsealed order details
   * @throws Error if the API request fails or if the API key is not set
   */
  public static async unsealOrder(id: string): Promise<UnsealedOrderResponse> {
    return authenticatedApiClient.unsealOrder(id);
  }
}
