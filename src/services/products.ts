import { ProductDetailResponse } from "../schemas/detail.js";
import { makeApiRequest } from "../utils/api.js";

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
  public static async getProductDetails(
    id: string
  ): Promise<ProductDetailResponse> {
    const url = `${this.BASE_URL}/${id}`;
    return makeApiRequest<ProductDetailResponse>(url, {
      method: "GET",
    }, "ProductService");
  }
}
