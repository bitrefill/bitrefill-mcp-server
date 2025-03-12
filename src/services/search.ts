import { SearchResults } from "../types/index.js";

/**
 * Service for searching products
 */
export class SearchService {
  /**
   * Search for products by query
   * @param query - Search query string
   * @returns Search results
   */
  public static search(query: string): SearchResults {
    // This is a static implementation for demonstration
    // In a real implementation, this would call an API or database
    return {
      results: [
        { id: "amazon-us", name: "Amazon US", type: "Gift Card" },
        { id: "steam", name: "Steam", type: "Gaming" },
        { id: "att-prepaid", name: "AT&T Prepaid", type: "Mobile Topup" },
        { id: "netflix", name: "Netflix", type: "Entertainment" },
        { id: "uber", name: "Uber", type: "Travel" }
      ]
    };
  }
}
