/**
 * Type definitions for Bitrefill MCP server
 */

/**
 * Product category type
 */
export type ProductCategory = string;

/**
 * Product interface
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  denominations: number[];
  country: string;
  category: ProductCategory;
}

/**
 * Search result item interface
 */
export interface SearchResultItem {
  id: string;
  name: string;
  type: string;
}

/**
 * Search results interface
 */
export interface SearchResults {
  results: SearchResultItem[];
}

/**
 * Order interface
 */
export interface Order {
  order_id: string;
  product: string;
  amount_usd: number;
  payment_address: string;
  amount_btc: string;
  expires_in: string;
}
