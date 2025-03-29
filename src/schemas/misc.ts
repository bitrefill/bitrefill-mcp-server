/**
 * Type definitions for miscellaneous Bitrefill API endpoints
 */
import { z } from "zod";

/**
 * Ping response schema
 */
export const PingResponseSchema = z.object({
  meta: z.object({
    _endpoint: z.string(),
  }),
  message: z.string().describe("Ping response message"),
});

/**
 * Ping response type
 */
export type PingResponse = z.infer<typeof PingResponseSchema>;

/**
 * Account balance response schema
 */
export const AccountBalanceResponseSchema = z.object({
  meta: z.object({
    _endpoint: z.string(),
  }),
  data: z.object({
    balance: z.number().describe("Account balance amount"),
    currency: z.string().describe("Account balance currency"),
  }),
});

/**
 * Account balance response type
 */
export type AccountBalanceResponse = z.infer<typeof AccountBalanceResponseSchema>;

/**
 * Check phone number request options schema
 */
export const CheckPhoneNumberOptionsSchema = z.object({
  phone_number: z.string().describe("The phone number to be checked"),
  operator: z.string().optional().describe("The phone's operator if known"),
});

/**
 * Check phone number options type
 */
export type CheckPhoneNumberOptions = z.infer<typeof CheckPhoneNumberOptionsSchema>;

/**
 * Check phone number response schema
 */
export const CheckPhoneNumberResponseSchema = z.object({
  meta: z.object({
    phone_number: z.string(),
    operator: z.string().optional(),
    _endpoint: z.string(),
  }),
  data: z.object({
    id: z.string().describe("Product ID for this phone number"),
    name: z.string().describe("Product name"),
    country_code: z.string().describe("Country code"),
    country_name: z.string().describe("Country name"),
    currency: z.string().describe("Currency"),
    created_time: z.string().describe("Creation timestamp"),
    recipient_type: z.string().describe("Recipient type"),
    image: z.string().describe("Product image URL"),
    in_stock: z.boolean().describe("Whether the product is in stock"),
  }),
  operator_found: z.boolean().describe("Whether an operator was found for this phone number"),
});
