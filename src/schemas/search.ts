/**
 * Type definitions for Bitrefill MCP server
 */
import { z } from "zod";

/**
 * Search options schema
 */
export const SearchOptions = {
  query: z.string().describe("Search query (e.g., 'Amazon', 'Netflix', 'AT&T' or '*' for all)"),
  country: z.string().optional().describe("Country code (e.g., 'US', 'IT', 'GB')"),
  language: z.string().optional().describe("Language code for results (e.g., 'en')"),
  limit: z.number().optional().describe("Maximum number of results to return"),
  skip: z.number().optional().describe("Number of results to skip (for pagination)"),
  category: z.string().optional().describe("Filter by category (e.g., 'gaming', 'entertainment')"),
  beta_flags: z.string().optional().describe("Beta feature flags"),
  cart: z.string().optional().describe("Cart identifier"),
  do_recommend: z.number().optional().describe("Enable recommendations"),
  rec: z.number().optional().describe("Recommendation parameter"),
  sec: z.number().optional().describe("Security parameter"),
  col: z.number().optional().describe("Column layout parameter"),
  prefcc: z.number().optional().describe("Preferred country code parameter"),
  src: z.string().optional().describe("Source of the request"),
};

export const SearchOptionsSchema = z.object(SearchOptions);
/**
 * Search options interface
 */
export type SearchOptionsType = z.infer<typeof SearchOptionsSchema>;

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