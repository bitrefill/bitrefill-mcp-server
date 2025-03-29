/**
 * Type definitions for Bitrefill Order API
 */
import { z } from "zod";

/**
 * Order list request options schema
 */
export const OrderListOptionsSchema = z.object({
  start: z.number().int().nonnegative().optional().describe("Start index. Default: 0"),
  limit: z.number().int().positive().max(50).optional().describe("Maximum number of records. Maximum/Default: 50"),
  after: z.string().optional().describe("Start date for limiting results (Inclusive). Format: YYYY-MM-DD HH:MM:SS"),
  before: z.string().optional().describe("End date for limiting results (Non-Inclusive). Format: YYYY-MM-DD HH:MM:SS"),
});

/**
 * Order list options type
 */
export type OrderListOptions = z.infer<typeof OrderListOptionsSchema>;

/**
 * Product information schema within an order
 */
export const OrderProductSchema = z.object({
  id: z.string().describe("Product ID"),
  name: z.string().describe("Product name"),
  value: z.string().describe("Product value"),
  currency: z.string().describe("Product currency"),
  image: z.string().describe("Product image URL"),
  _href: z.string().optional().describe("Product API endpoint"),
});

/**
 * Order list response schema
 */
export const OrderListResponseSchema = z.object({
  meta: z.object({
    start: z.number(),
    limit: z.number(),
    after: z.string().optional(),
    before: z.string().optional(),
    _endpoint: z.string(),
  }),
  data: z.array(
    z.object({
      id: z.string().describe("Unique order identifier"),
      status: z.string().describe("Order status"),
      product: OrderProductSchema,
      created_time: z.string().describe("Creation timestamp"),
      delivered_time: z.string().optional().describe("Delivery timestamp"),
      redemption_info: z.string().optional().describe("Information on how to redeem the product"),
      commission: z.number().optional().describe("Commission amount"),
      user: z.object({
        id: z.string(),
        email: z.string(),
      }).optional(),
      invoice: z.object({
        id: z.string(),
        _href: z.string().optional(),
      }).optional(),
    })
  ),
});

/**
 * Order list response type
 */
export type OrderListResponse = z.infer<typeof OrderListResponseSchema>;

/**
 * Order detail response schema
 */
export const OrderDetailResponseSchema = z.object({
  meta: z.object({
    id: z.string(),
    _endpoint: z.string(),
  }),
  data: z.object({
    id: z.string().describe("Unique order identifier"),
    status: z.string().describe("Order status"),
    product: OrderProductSchema,
    created_time: z.string().describe("Creation timestamp"),
    delivered_time: z.string().optional().describe("Delivery timestamp"),
    redemption_info: z.string().optional().describe("Information on how to redeem the product"),
  }),
});

/**
 * Order detail response type
 */
export type OrderDetailResponse = z.infer<typeof OrderDetailResponseSchema>;

/**
 * Unsealed order response schema
 */
export const UnsealedOrderResponseSchema = OrderDetailResponseSchema.extend({
  data: z.object({
    id: z.string().describe("Unique order identifier"),
    status: z.string().describe("Order status"),
    product: OrderProductSchema,
    created_time: z.string().describe("Creation timestamp"),
    delivered_time: z.string().optional().describe("Delivery timestamp"),
    redemption_info: z.string().optional().describe("Information on how to redeem the product"),
    pin: z.string().optional().describe("PIN code, if applicable"),
    code: z.string().optional().describe("Gift card code, if applicable"),
    link: z.string().optional().describe("Gift card link, if applicable"),
    pin_code: z.string().optional().describe("Alternative PIN code format"),
    phone_number: z.string().optional().describe("Phone number, for top-ups"),
  }),
});

/**
 * Unsealed order response type
 */
export type UnsealedOrderResponse = z.infer<typeof UnsealedOrderResponseSchema>;
