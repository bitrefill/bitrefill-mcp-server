/**
 * Type definitions for Bitrefill MCP server
 */
import { z } from "zod";

/**
 * Search options schema
 */
export const SearchOptionsSchema = z.object({
  query: z.string(),
  country: z.string().optional(),
  language: z.string().optional(),
  limit: z.number().optional(),
  skip: z.number().optional(),
  category: z.string().optional(),
  beta_flags: z.string().optional(),
  cart: z.string().optional(),
  do_recommend: z.number().optional(),
  rec: z.number().optional(),
  sec: z.number().optional(),
  col: z.number().optional(),
  prefcc: z.number().optional(),
  src: z.string().optional(),
});

/**
 * Search options interface
 */
export type SearchOptions = z.infer<typeof SearchOptionsSchema>;

/**
 * Search result item schema
 */
export const SearchResultItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  url: z.string(),
  _priceRange: z.string().optional(),
  _ratingValue: z.number().optional(),
  _reviewCount: z.number().optional(),
  baseName: z.string().optional(),
  billCategories: z.array(z.any()).optional(),
  cashbackDisabled: z.boolean().optional(),
  cashbackPercentage: z.number().optional(),
  cashbackPercentageFinal: z.number().optional(),
  categories: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
  countryCode: z.string().optional(),
  currency: z.string().optional(),
  isRanged: z.boolean().optional(),
  range: z.record(z.any()).optional(),
  redemptionMethods: z.array(z.string()).optional(),
  slug: z.string().optional(),
  usageMethods: z.array(z.string()).optional(),
  usps: z.array(z.string()).optional(),
});

/**
 * Search result item interface
 */
export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;

/**
 * Search results schema
 */
export const SearchResultsSchema = z.object({
  results: z.array(SearchResultItemSchema),
});

/**
 * Search results interface
 */
export type SearchResults = z.infer<typeof SearchResultsSchema>;

/**
 * Product categories map schema
 */
export const ProductCategoriesMapSchema = z.record(z.array(z.string()));

/**
 * Product types and their associated categories
 */
export type ProductCategoriesMap = z.infer<typeof ProductCategoriesMapSchema>;

/**
 * API response schema for Bitrefill search
 */
export const BitrefillSearchResponseSchema = z.object({
  products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
      categories: z.array(z.string()).optional(),
      countries: z.array(z.string()).optional(),
      countryCode: z.string().optional(),
      currency: z.string().optional(),
      type: z.string().optional(),
      redemptionMethods: z.array(z.string()).optional(),
      baseName: z.string().optional(),
      slug: z.string().optional(),
      snippet: z.string().optional(),
      iconPreview: z.string().optional(),
    }).catchall(z.any())
  ),
  totalCount: z.number().optional(),
  categories: ProductCategoriesMapSchema.optional(),
}).catchall(z.any());

/**
 * API response interface for Bitrefill search
 */
export type BitrefillSearchResponse = z.infer<typeof BitrefillSearchResponseSchema>;

/**
 * Product Detail Response schema for the complete product details from API
 */
export const ProductDetailResponseSchema = z.object({
  _id: z.string(),
  slug: z.string(),
  name: z.string(),
  baseName: z.string(),
  noIndex: z.boolean().optional(),
  logoBackground: z.string().optional(),
  logoForeground: z.string().optional(),
  isLogoSvgPreferred: z.boolean().optional(),
  logoVersion: z.number().optional(),
  logoImage: z.string(),
  logoPreview: z.string(),
  iconPreview: z.string(),
  iconVersion: z.number().optional(),
  iconImage: z.string().optional(),
  iconBackground: z.string().optional(),
  iconForeground: z.string().optional(),
  iconNoMargin: z.boolean().optional(),
  type: z.string(),
  categories: z.array(z.string()),
  stats: z.object({
    popularity: z.number().optional(),
    packageSize: z.number().optional(),
  }).optional(),
  countryStat: z.record(z.number()).optional(),
  countryCode: z.string(),
  countries: z.array(z.string()),
  recipientType: z.string().optional(),
  isPinBased: z.boolean().optional(),
  outOfStock: z.boolean().optional(),
  ratings: z.object({
    reviewCount: z.number(),
    ratingValue: z.number(),
    ratingCount: z.number().optional(),
    scoreDistribution: z.array(z.number()).optional(),
    reviews: z.array(z.object({
      id: z.string(),
      content: z.string(),
      score: z.number(),
      scoreMax: z.number(),
      authorName: z.string(),
      createdTime: z.string(),
      source: z.string(),
      author: z.string(),
      extract: z.string().optional(),
      score_max: z.number().optional(),
      date: z.string().optional(),
      feedback_url: z.string().optional(),
    })).optional(),
  }).optional(),
  packages: z.array(z.object({
    display: z.string().nullable().optional(),
    value: z.string(),
    eurValue: z.number(),
    amount: z.number(),
    eurPrice: z.number(),
    usdPrice: z.number(),
    prices: z.record(z.number()),
  })),
  currency: z.string(),
  terms: z.string().optional(),
  termsLink: z.string().optional(),
  languages: z.record(z.boolean()).optional(),
  descriptions: z.record(z.string()).optional(),
  subtitles: z.record(z.string()).optional(),
  instructions: z.record(z.string()).optional(),
  redemptionMethods: z.array(z.string()).optional(),
  relatedX: z.array(z.object({
    _id: z.string(),
    name: z.string(),
    slug: z.string(),
    logoImage: z.string().optional(),
    logoPreview: z.string().optional(),
    iconPreview: z.string().optional(),
    cashbackDisabled: z.boolean().optional(),
    logoVersion: z.number().optional(),
    countries: z.array(z.string()).optional(),
    type: z.string().optional(),
    countryCode: z.string().optional(),
    categories: z.array(z.string()).optional(),
    range: z.object({
      min: z.number(),
      max: z.number(),
      step: z.number(),
      customerEurPriceRate: z.number().optional(),
      customerUsdPriceRate: z.number().optional(),
      eurValueRate: z.number().optional(),
      purchaseFeeEur: z.number().nullable().optional(),
      purchaseFeeUsd: z.number().nullable().optional(),
    }).optional(),
    currency: z.string().optional(),
    _ratingValue: z.number().optional(),
    _reviewCount: z.number().optional(),
    _priceRange: z.string().optional(),
    _expandedCC: z.record(z.number()).optional(),
    _sortOrderCC: z.record(z.number()).optional(),
    logoBackground: z.string().optional(),
    logoNoMargin: z.boolean().optional(),
    label: z.string().optional(),
    cashbackPercentageFinal: z.number().optional(),
    isRanged: z.boolean().optional(),
    _noIos: z.boolean().optional(),
  })).optional(),
  cashbackDisabled: z.boolean().optional(),
  _ratingValue: z.number().optional(),
  _reviewCount: z.number().optional(),
  _priceRange: z.string().optional(),
  _expandedCC: z.record(z.number()).optional(),
});

/**
 * Product Detail Response interface for the complete product details from API
 */
export type ProductDetailResponse = z.infer<typeof ProductDetailResponseSchema>;
