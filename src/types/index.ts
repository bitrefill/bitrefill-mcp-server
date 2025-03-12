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
 * Search options interface
 */
export interface SearchOptions {
  query: string;
  country?: string;
  language?: string;
  limit?: number;
  skip?: number;
  category?: string;
  beta_flags?: string;
  cart?: string;
  do_recommend?: number;
  rec?: number;
  sec?: number;
  col?: number;
  prefcc?: number;
  src?: string;
}

/**
 * Search result item interface
 */
export interface SearchResultItem {
  id: string;
  name: string;
  type: string;
  _priceRange?: string;
  _ratingValue?: number;
  _reviewCount?: number;
  baseName?: string;
  billCategories?: any[];
  cashbackDisabled?: boolean;
  cashbackPercentage?: number;
  cashbackPercentageFinal?: number;
  categories?: string[];
  countries?: string[];
  countryCode?: string;
  currency?: string;
  isRanged?: boolean;
  range?: Record<string, any>;
  redemptionMethods?: string[];
  slug?: string;
  usageMethods?: string[];
  usps?: string[];
}

/**
 * Search results interface
 */
export interface SearchResults {
  results: SearchResultItem[];
}

/**
 * API response interface for Bitrefill search
 */
export interface BitrefillSearchResponse {
  products: Array<{
    id: string;
    name: string;
    category: string;
    categories?: string[];
    countries?: string[];
    countryCode?: string;
    currency?: string;
    type?: string;
    redemptionMethods?: string[];
    baseName?: string;
    slug?: string;
    snippet?: string;
    iconPreview?: string;
    [key: string]: any;
  }>;
  totalCount?: number;
  categories?: {
    giftcards?: string[];
    refills?: string[];
    bills?: string[];
    esims?: string[];
    [key: string]: string[] | undefined;
  };
  [key: string]: any;
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
