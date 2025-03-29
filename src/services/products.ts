import { ProductDetailResponse } from "../schemas/detail.js";
import { publicApiClient } from "../utils/api/public.js";

/**
 * Service for product operations
 * Uses the PublicApiClient for API requests
 */
export class ProductService {
  /**
   * Get product details by ID
   * @param id - Product ID
   * @returns ProductDetailResponse with complete product details
   * @throws Error if the API request fails
   */
  public static async getProductDetails(
    id: string
  ): Promise<ProductDetailResponse> {
    return publicApiClient.getProductDetails(id);
  }
}
