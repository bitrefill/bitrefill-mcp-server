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
  url: string;
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
 * Product types and their associated categories
 */
export interface ProductCategoriesMap {
  giftcards: string[];
  refills: string[];
  bills: string[];
  esims: string[];
  "crypto-utils": string[];
  [key: string]: string[];
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
  categories?: ProductCategoriesMap;
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

/**
 * Product Detail Response interface for the complete product details from API
 */
export interface ProductDetailResponse {
  _id: string;
  slug: string;
  name: string;
  baseName: string;
  noIndex?: boolean;
  logoBackground?: string;
  logoForeground?: string;
  isLogoSvgPreferred?: boolean;
  logoVersion?: number;
  logoImage: string;
  logoPreview: string;
  iconPreview: string;
  iconVersion?: number;
  iconImage?: string;
  iconBackground?: string;
  iconForeground?: string;
  iconNoMargin?: boolean;
  type: string;
  categories: string[];
  stats?: {
    popularity?: number;
    packageSize?: number;
  };
  countryStat?: Record<string, number>;
  countryCode: string;
  countries: string[];
  recipientType?: string;
  isPinBased?: boolean;
  outOfStock?: boolean;
  ratings?: {
    reviewCount: number;
    ratingValue: number;
    ratingCount?: number;
    scoreDistribution?: number[];
    reviews?: Array<{
      id: string;
      content: string;
      score: number;
      scoreMax: number;
      authorName: string;
      createdTime: string;
      source: string;
      author: string;
      extract?: string;
      score_max?: number;
      date?: string;
      feedback_url?: string;
    }>;
  };
  packages: Array<{
    display?: string | null;
    value: string;
    eurValue: number;
    amount: number;
    eurPrice: number;
    usdPrice: number;
    prices: Record<string, number>;
  }>;
  currency: string;
  terms?: string;
  termsLink?: string;
  languages?: Record<string, boolean>;
  descriptions?: Record<string, string>;
  subtitles?: Record<string, string>;
  instructions?: Record<string, string>;
  redemptionMethods?: string[];
  relatedX?: Array<{
    _id: string;
    name: string;
    slug: string;
    logoImage?: string;
    logoPreview?: string;
    iconPreview?: string;
    cashbackDisabled?: boolean;
    logoVersion?: number;
    countries?: string[];
    type?: string;
    countryCode?: string;
    categories?: string[];
    range?: {
      min: number;
      max: number;
      step: number;
      customerEurPriceRate?: number;
      customerUsdPriceRate?: number;
      eurValueRate?: number;
      purchaseFeeEur?: number | null;
      purchaseFeeUsd?: number | null;
    };
    currency?: string;
    _ratingValue?: number;
    _reviewCount?: number;
    _priceRange?: string;
    _expandedCC?: Record<string, number>;
    _sortOrderCC?: Record<string, number>;
    logoBackground?: string;
    logoNoMargin?: boolean;
    label?: string;
    cashbackPercentageFinal?: number;
    isRanged?: boolean;
    _noIos?: boolean;
  }>;
  cashbackDisabled?: boolean;
  _ratingValue?: number;
  _reviewCount?: number;
  _priceRange?: string;
  _expandedCC?: Record<string, number>;
}
