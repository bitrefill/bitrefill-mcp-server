import { Product } from "../types/index.js";

/**
 * Service for product operations
 */
export class ProductService {
  /**
   * Get product details by ID
   * @param id - Product ID
   * @returns Product details
   */
  public static getProductDetails(id: string): Product {
    // This is a static implementation for demonstration
    // In a real implementation, this would call an API or database
    return {
      id: id,
      name: id === "amazon-us" ? "Amazon US Gift Card" : 
           id === "steam" ? "Steam Gift Card" : 
           id === "att-prepaid" ? "AT&T Prepaid" : 
           id === "netflix" ? "Netflix Gift Card" : 
           id === "uber" ? "Uber Gift Card" : "Unknown Product",
      description: "Use this digital code to shop for millions of items at competitive prices",
      denominations: [25, 50, 100, 200],
      country: "United States",
      category: id === "amazon-us" ? "Gift Cards" : 
               id === "steam" ? "Gaming" : 
               id === "att-prepaid" ? "Mobile Topup" : 
               id === "netflix" ? "Entertainment" : 
               id === "uber" ? "Travel" : "Unknown"
    };
  }
}
