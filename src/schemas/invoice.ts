/**
 * Type definitions for Bitrefill Invoice API
 */
import { z } from "zod";
import { paymentMethods } from "../constants/payment_methods.js";
/**
 * Product item schema for invoice creation
 */
export const InvoiceProductSchema = z.object({
  product_id: z.string().describe("Required: Product slug/ID"),
  quantity: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Optional: Default is 1"),
  value: z.number().optional().describe("Required for variable-value products"),
  package_id: z
    .string()
    .optional()
    .describe("Alternative to value for package selection"),
  phone_number: z.string().optional().describe("Required for phone top-ups"),
  send_email: z
    .boolean()
    .optional()
    .describe("Optional: Whether to send email for this product"),
  send_sms: z
    .boolean()
    .optional()
    .describe("Optional: Whether to send SMS for this product"),
});

// Ensure one between value or package_id must be present
InvoiceProductSchema.refine(
  (data) => data.value !== undefined || data.package_id !== undefined,
  {
    message: "Either value or package_id must be present",
  }
);

/**
 * Invoice creation request schema
 */
export const CreateInvoiceRequest = {
  products: z
    .array(InvoiceProductSchema)
    .min(1)
    .describe("Array of products to include in the invoice"),
  payment_method: z
    .enum(["balance", "bitcoin", "lightning", "ethereum"])
    .describe(`Required payment method. Available methods: ${paymentMethods.join(", ")}`),
  webhook_url: z
    .string()
    .url()
    .optional()
    .describe("Optional: URL for webhook notifications"),
  auto_pay: z
    .boolean()
    .optional()
    .describe("Optional: Automatically pay with balance"),
};

export const CreateInvoiceRequestSchema = z.object(CreateInvoiceRequest);

/**
 * Invoice creation request type
 */
export type CreateInvoiceRequest = z.infer<typeof CreateInvoiceRequestSchema>;

/**
 * Invoice response schema
 */
export const InvoiceResponseSchema = z.object({
  id: z.string().describe("Unique invoice identifier"),
  status: z.string().describe("Invoice status"),
  created_at: z.string().describe("Creation timestamp"),
  expires_at: z.string().describe("Expiration timestamp"),
  amount: z.number().describe("Invoice amount"),
  currency: z.string().describe("Invoice currency"),
  payment_method: z.string().describe("Payment method"),
  payment_url: z
    .string()
    .optional()
    .describe("URL for payment (if applicable)"),
  products: z
    .array(
      z.object({
        product_id: z.string(),
        name: z.string().optional(),
        quantity: z.number(),
        price: z.number(),
      })
    )
    .describe("Products included in this invoice"),
  payment_details: z
    .object({
      address: z.string().optional(),
      lightning_invoice: z.string().optional(),
      amount_btc: z.number().optional(),
      amount_sat: z.number().optional(),
      exchange_rate: z.number().optional(),
    })
    .optional()
    .describe("Payment-specific details"),
});

/**
 * Invoice response type
 */
export type InvoiceResponse = z.infer<typeof InvoiceResponseSchema>;
