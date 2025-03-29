/**
 * Type definitions for Bitrefill Invoice API
 */
import { z } from "zod";
import { paymentMethods } from "../constants/payment_methods.js";

/**
 * Invoice list request options schema
 */
export const InvoiceListOptionsSchema = z.object({
  start: z.number().int().nonnegative().optional().describe("Start index. Default: 0"),
  limit: z.number().int().positive().max(50).optional().describe("Maximum number of records. Maximum/Default: 50"),
  after: z.string().optional().describe("Start date for limiting results (Inclusive). Format: YYYY-MM-DD HH:MM:SS"),
  before: z.string().optional().describe("End date for limiting results (Non-Inclusive). Format: YYYY-MM-DD HH:MM:SS"),
});

/**
 * Invoice list options type
 */
export type InvoiceListOptions = z.infer<typeof InvoiceListOptionsSchema>;

/**
 * Get invoice by ID response schema
 */
export const InvoiceDetailResponseSchema = z.object({
  meta: z.object({
    id: z.string(),
    _endpoint: z.string(),
  }),
  data: z.object({
    id: z.string().describe("Unique invoice identifier"),
    created_time: z.string().describe("Creation timestamp"),
    completed_time: z.string().optional().describe("Completion timestamp"),
    status: z.string().describe("Invoice status"),
    user: z.object({
      id: z.string(),
      email: z.string(),
    }).optional(),
    payment: z.object({
      method: z.string().describe("Payment method"),
      address: z.string().optional().describe("Payment address"),
      currency: z.string().describe("Currency"),
      price: z.number().describe("Price"),
      status: z.string().describe("Payment status"),
      commission: z.number().optional().describe("Commission"),
    }),
  }),
});

/**
 * Invoice detail response type
 */
export type InvoiceDetailResponse = z.infer<typeof InvoiceDetailResponseSchema>;

/**
 * Invoice list response schema
 */
export const InvoiceListResponseSchema = z.object({
  meta: z.object({
    start: z.number(),
    limit: z.number(),
    after: z.string().optional(),
    before: z.string().optional(),
    _endpoint: z.string(),
  }),
  data: z.array(
    z.object({
      id: z.string().describe("Unique invoice identifier"),
      created_time: z.string().describe("Creation timestamp"),
      completed_time: z.string().optional().describe("Completion timestamp"),
      status: z.string().describe("Invoice status"),
      user: z.object({
        id: z.string(),
        email: z.string(),
      }).optional(),
      payment: z.object({
        method: z.string().describe("Payment method"),
        address: z.string().optional().describe("Payment address"),
        currency: z.string().describe("Currency"),
        price: z.number().describe("Price"),
        status: z.string().describe("Payment status"),
        commission: z.number().optional().describe("Commission"),
      }),
    })
  ),
});

/**
 * Invoice list response type
 */
export type InvoiceListResponse = z.infer<typeof InvoiceListResponseSchema>;

/**
 * Pay invoice response schema
 */
export const PayInvoiceResponseSchema = z.object({
  meta: z.object({
    id: z.string(),
    _endpoint: z.string(),
  }),
  data: z.object({
    id: z.string().describe("Unique invoice identifier"),
    created_time: z.string().describe("Creation timestamp"),
    completed_time: z.string().describe("Completion timestamp"),
    status: z.string().describe("Invoice status after payment attempt"),
    payment: z.object({
      method: z.string().describe("Payment method"),
      currency: z.string().describe("Currency"),
      price: z.number().describe("Price"),
      status: z.string().describe("Payment status after payment attempt"),
    }),
  }),
});

/**
 * Pay invoice response type
 */
export type PayInvoiceResponse = z.infer<typeof PayInvoiceResponseSchema>;
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
  value: z.number().optional().describe("Required for variable-value products. Use the exact value present in packages.amount for the package to buy"),
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
