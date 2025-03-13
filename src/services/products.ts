import { ProductDetailResponse } from "../types/index.js";
import { logError } from "../utils/index.js";

/**
 * Service for product operations
 */
export class ProductService {
  private static readonly BASE_URL = "https://www.bitrefill.com/api/product";
  
  /**
   * Get product details by ID
   * @param id - Product ID
   * @returns ProductDetailResponse with complete product details
   * @throws Error if the API request fails
   */
  public static async getProductDetails(id: string): Promise<ProductDetailResponse> {
    try {
      const url = `${this.BASE_URL}/${id}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "accept": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json() as ProductDetailResponse;
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), "ProductService");
      // Rethrow the error instead of providing a fallback
      throw error;
    }
  }
}
