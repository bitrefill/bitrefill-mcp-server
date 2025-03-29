import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SearchOptions } from "../schemas/search.js";
import { SearchService } from "../services/search.js";
import { ProductService } from "../services/products.js";
import { InvoiceService } from "../services/invoices.js";
import { OrderService } from "../services/orders.js";
import { MiscService } from "../services/misc.js";
import { productCategories } from "../constants/categories.js";
import {
  CreateInvoiceRequest,
  CreateInvoiceRequestSchema,
  InvoiceListOptionsSchema,
  InvoiceDetailResponseSchema,
  PayInvoiceResponseSchema
} from "../schemas/invoice.js";
import {
  OrderListOptionsSchema,
  OrderDetailResponseSchema,
  UnsealedOrderResponseSchema
} from "../schemas/order.js";
import {
  CheckPhoneNumberOptionsSchema
} from "../schemas/misc.js";
import { z } from "zod";

/**
 * Register tool handlers with the server
 * @param server - MCP server instance
 */
export function registerToolHandlers(server: McpServer): void {
  /**
   * Search tool
   * Allows searching for gift cards, esims, mobile topups and more.
   * @param args - Search arguments
   * @returns Search results
   */
  server.tool(
    "search",
    "Search for gift cards, esims, mobile topups and more. It's suggested to use the `categories` tool before searching for products, to have a better understanding of what's available.",
    SearchOptions,
    async (args) => {
      try {
        const searchResults = await SearchService.search(args.query, args);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(searchResults, null, 2) }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: errorMessage }, null, 2),
            },
          ],
          isError: true,
        };
      }
    }
  );

  /**
   * Detail tool
   * Retrieves detailed information about a specific product.
   * @param args - Product identifier
   * @returns Detailed product information
   */
  server.tool(
    "detail",
    "Get detailed information about a product",
    {
      id: z.string().describe("Unique identifier of the product"),
    },
    async (args) => {
      try {
        const productDetail = await ProductService.getProductDetails(args.id);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(productDetail, null, 2) }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: errorMessage }, null, 2),
            },
          ],
          isError: true,
        };
      }
    }
  );

  /**
   * Categories tool
   * Provides a map of product types and their associated categories.
   * @returns Complete product categories hierarchy
   */
  server.tool(
    "categories",
    "Get the full product type/categories map. It's suggested to use this tool to get the categories and then use the `search` tool to search for products in a specific category.",
    {},
    async () => {
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(productCategories, null, 2) }
        ]
      };
    }
  );

  // Conditionally register the create_invoice tool only if the API key is available
  if (InvoiceService.isAvailable()) {
    /**
     * Create Invoice tool
     * Creates a new invoice for products
     * @param args - Invoice creation arguments
     * @returns Invoice details
     */
    server.tool(
      "create_invoice",
      "Create a new invoice for purchasing products with various payment methods",
      CreateInvoiceRequest,
      async (args) => {
        try {
          const validatedArgs = CreateInvoiceRequestSchema.parse(args);
          const invoice = await InvoiceService.createInvoice(validatedArgs);
          return {
            content: [
              { type: "text" as const, text: JSON.stringify(invoice, null, 2) }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: errorMessage }, null, 2),
              },
            ],
            isError: true,
          };
        }
      }
    );

    /**
     * Get Invoices tool
     * Retrieves a list of invoices
     * @param args - Filtering options
     * @returns List of invoices
     */
    server.tool(
      "get_invoices",
      "Retrieve a list of invoices with optional filtering",
      {
        start: z.number().int().nonnegative().optional().describe("Start index. Default: 0"),
        limit: z.number().int().positive().max(50).optional().describe("Maximum number of records. Maximum/Default: 50"),
        after: z.string().optional().describe("Start date for limiting results (Inclusive). Format: YYYY-MM-DD HH:MM:SS"),
        before: z.string().optional().describe("End date for limiting results (Non-Inclusive). Format: YYYY-MM-DD HH:MM:SS"),
      },
      async (args) => {
        try {
          const invoices = await InvoiceService.getInvoices(args);
          return {
            content: [
              { type: "text" as const, text: JSON.stringify(invoices, null, 2) }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: errorMessage }, null, 2),
              },
            ],
            isError: true,
          };
        }
      }
    );

    /**
     * Get Invoice by ID tool
     * Retrieves a specific invoice by its ID
     * @param args - Invoice ID
     * @returns Invoice details
     */
    server.tool(
      "get_invoice",
      "Retrieve details for a specific invoice by ID",
      {
        id: z.string().describe("Unique invoice identifier"),
      },
      async (args) => {
        try {
          const invoice = await InvoiceService.getInvoiceById(args.id);
          return {
            content: [
              { type: "text" as const, text: JSON.stringify(invoice, null, 2) }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: errorMessage }, null, 2),
              },
            ],
            isError: true,
          };
        }
      }
    );

    /**
     * Pay Invoice tool
     * Pays an unpaid invoice
     * @param args - Invoice ID
     * @returns Payment result
     */
    server.tool(
      "pay_invoice",
      "Pay an unpaid invoice (only works with 'balance' payment method)",
      {
        id: z.string().describe("Unique invoice identifier"),
      },
      async (args) => {
        try {
          const result = await InvoiceService.payInvoice(args.id);
          return {
            content: [
              { type: "text" as const, text: JSON.stringify(result, null, 2) }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: errorMessage }, null, 2),
              },
            ],
            isError: true,
          };
        }
      }
    );

    /**
     * Get Orders tool
     * Retrieves a list of orders
     * @param args - Filtering options
     * @returns List of orders
     */
    server.tool(
      "get_orders",
      "Retrieve a list of orders with optional filtering",
      {
        start: z.number().int().nonnegative().optional().describe("Start index. Default: 0"),
        limit: z.number().int().positive().max(50).optional().describe("Maximum number of records. Maximum/Default: 50"),
        after: z.string().optional().describe("Start date for limiting results (Inclusive). Format: YYYY-MM-DD HH:MM:SS"),
        before: z.string().optional().describe("End date for limiting results (Non-Inclusive). Format: YYYY-MM-DD HH:MM:SS"),
      },
      async (args) => {
        try {
          const orders = await OrderService.getOrders(args);
          return {
            content: [
              { type: "text" as const, text: JSON.stringify(orders, null, 2) }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: errorMessage }, null, 2),
              },
            ],
            isError: true,
          };
        }
      }
    );

    /**
     * Get Order by ID tool
     * Retrieves a specific order by its ID
     * @param args - Order ID
     * @returns Order details
     */
    server.tool(
      "get_order",
      "Retrieve details for a specific order by ID",
      {
        id: z.string().describe("Unique order identifier"),
      },
      async (args) => {
        try {
          const order = await OrderService.getOrderById(args.id);
          return {
            content: [
              { type: "text" as const, text: JSON.stringify(order, null, 2) }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: errorMessage }, null, 2),
              },
            ],
            isError: true,
          };
        }
      }
    );

    /**
     * Unseal Order tool
     * Reveals codes and PINs for a specific order
     * @param args - Order ID
     * @returns Unsealed order details
     */
    server.tool(
      "unseal_order",
      "Reveal codes and PINs for a specific order by ID",
      {
        id: z.string().describe("Unique order identifier"),
      },
      async (args) => {
        try {
          const order = await OrderService.unsealOrder(args.id);
          return {
            content: [
              { type: "text" as const, text: JSON.stringify(order, null, 2) }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: errorMessage }, null, 2),
              },
            ],
            isError: true,
          };
        }
      }
    );

    /**
     * Get Account Balance tool
     * Retrieves the account balance
     * @returns Account balance
     */
    server.tool(
      "get_account_balance",
      "Retrieve your account balance",
      {},
      async () => {
        try {
          const balance = await MiscService.getAccountBalance();
          return {
            content: [
              { type: "text" as const, text: JSON.stringify(balance, null, 2) }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: errorMessage }, null, 2),
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Ping tool
   * Checks if the API is available
   * @returns Ping response
   */
  server.tool(
    "ping",
    "Check if the Bitrefill API is available",
    {},
    async () => {
      try {
        const ping = await MiscService.ping();
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(ping, null, 2) }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: errorMessage }, null, 2),
            },
          ],
          isError: true,
        };
      }
    }
  );
}
