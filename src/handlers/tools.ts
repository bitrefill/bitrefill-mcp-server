import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod/v4';
import { SearchOptions, SearchResultsSchema, CategoriesToolOutputSchema } from '../schemas/search.js';
import { SearchService } from '../services/search.js';
import { ProductService } from '../services/products.js';
import { InvoiceService } from '../services/invoices.js';
import { OrderService } from '../services/orders.js';
import { MiscService } from '../services/misc.js';
import { productCategories } from '../constants/categories.js';
import {
    CreateInvoiceRequest,
    InvoiceResponseSchema,
    InvoiceListOptionsSchema,
    InvoiceListResponseSchema,
    InvoiceDetailResponseSchema,
    PayInvoiceResponseSchema,
} from '../schemas/invoice.js';
import { ProductDetailResponseSchema } from '../schemas/detail.js';
import {
    OrderListOptionsSchema,
    OrderListResponseSchema,
    OrderDetailResponseSchema,
    UnsealedOrderResponseSchema,
} from '../schemas/order.js';
import { AccountBalanceResponseSchema, PingResponseSchema } from '../schemas/misc.js';

function jsonText(data: unknown): { type: 'text'; text: string } {
    return { type: 'text', text: JSON.stringify(data, null, 2) };
}

function toolOk(data: object) {
    return {
        content: [jsonText(data)],
        structuredContent: { ...data },
    };
}

function toolErr(error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
        content: [jsonText({ error: errorMessage })],
        isError: true,
    };
}

/**
 * Register tool handlers with the server
 * @param server - MCP server instance
 */
export function registerToolHandlers(server: McpServer): void {
    server.registerTool(
        'search',
        {
            title: 'Search products',
            description:
                "Search for gift cards, esims, mobile topups and more. It's suggested to use the `categories` tool before searching for products, to have a better understanding of what's available.",
            inputSchema: SearchOptions,
            outputSchema: SearchResultsSchema.shape,
        },
        async (args) => {
            try {
                const searchResults = await SearchService.search(args.query, args);
                return toolOk(searchResults);
            } catch (error) {
                return toolErr(error);
            }
        }
    );

    server.registerTool(
        'detail',
        {
            title: 'Product details',
            description: 'Get detailed information about a product',
            inputSchema: {
                id: z.string().describe('Unique identifier of the product'),
            },
            outputSchema: ProductDetailResponseSchema.shape,
        },
        async (args) => {
            try {
                const productDetail = await ProductService.getProductDetails(args.id);
                return toolOk(productDetail);
            } catch (error) {
                return toolErr(error);
            }
        }
    );

    server.registerTool(
        'categories',
        {
            title: 'Product categories',
            description:
                "Get the full product type/categories map. It's suggested to use this tool to get the categories and then use the `search` tool to search for products in a specific category.",
            inputSchema: {},
            outputSchema: CategoriesToolOutputSchema.shape,
        },
        async () => {
            return toolOk({ categories: productCategories });
        }
    );

    if (InvoiceService.isAvailable()) {
        server.registerTool(
            'create_invoice',
            {
                title: 'Create invoice',
                description: 'Create a new invoice for purchasing products with various payment methods',
                inputSchema: CreateInvoiceRequest,
                outputSchema: InvoiceResponseSchema.shape,
            },
            async (args) => {
                try {
                    const invoice = await InvoiceService.createInvoice(args);
                    return toolOk(invoice);
                } catch (error) {
                    return toolErr(error);
                }
            }
        );

        server.registerTool(
            'get_invoices',
            {
                title: 'List invoices',
                description: 'Retrieve a list of invoices with optional filtering',
                inputSchema: InvoiceListOptionsSchema.shape,
                outputSchema: InvoiceListResponseSchema.shape,
            },
            async (args) => {
                try {
                    const invoices = await InvoiceService.getInvoices(args);
                    return toolOk(invoices);
                } catch (error) {
                    return toolErr(error);
                }
            }
        );

        server.registerTool(
            'get_invoice',
            {
                title: 'Get invoice',
                description: 'Retrieve details for a specific invoice by ID',
                inputSchema: {
                    id: z.string().describe('Unique invoice identifier'),
                },
                outputSchema: InvoiceDetailResponseSchema.shape,
            },
            async (args) => {
                try {
                    const invoice = await InvoiceService.getInvoiceById(args.id);
                    return toolOk(invoice);
                } catch (error) {
                    return toolErr(error);
                }
            }
        );

        server.registerTool(
            'pay_invoice',
            {
                title: 'Pay invoice',
                description: "Pay an unpaid invoice (only works with 'balance' payment method)",
                inputSchema: {
                    id: z.string().describe('Unique invoice identifier'),
                },
                outputSchema: PayInvoiceResponseSchema.shape,
            },
            async (args) => {
                try {
                    const result = await InvoiceService.payInvoice(args.id);
                    return toolOk(result);
                } catch (error) {
                    return toolErr(error);
                }
            }
        );

        server.registerTool(
            'get_orders',
            {
                title: 'List orders',
                description: 'Retrieve a list of orders with optional filtering',
                inputSchema: OrderListOptionsSchema.shape,
                outputSchema: OrderListResponseSchema.shape,
            },
            async (args) => {
                try {
                    const orders = await OrderService.getOrders(args);
                    return toolOk(orders);
                } catch (error) {
                    return toolErr(error);
                }
            }
        );

        server.registerTool(
            'get_order',
            {
                title: 'Get order',
                description: 'Retrieve details for a specific order by ID',
                inputSchema: {
                    id: z.string().describe('Unique order identifier'),
                },
                outputSchema: OrderDetailResponseSchema.shape,
            },
            async (args) => {
                try {
                    const order = await OrderService.getOrderById(args.id);
                    return toolOk(order);
                } catch (error) {
                    return toolErr(error);
                }
            }
        );

        server.registerTool(
            'unseal_order',
            {
                title: 'Unseal order',
                description: 'Reveal codes and PINs for a specific order by ID',
                inputSchema: {
                    id: z.string().describe('Unique order identifier'),
                },
                outputSchema: UnsealedOrderResponseSchema.shape,
            },
            async (args) => {
                try {
                    const order = await OrderService.unsealOrder(args.id);
                    return toolOk(order);
                } catch (error) {
                    return toolErr(error);
                }
            }
        );

        server.registerTool(
            'get_account_balance',
            {
                title: 'Account balance',
                description: 'Retrieve your account balance',
                inputSchema: {},
                outputSchema: AccountBalanceResponseSchema.shape,
            },
            async () => {
                try {
                    const balance = await MiscService.getAccountBalance();
                    return toolOk(balance);
                } catch (error) {
                    return toolErr(error);
                }
            }
        );
    }

    server.registerTool(
        'ping',
        {
            title: 'Ping API',
            description: 'Check if the Bitrefill API is available',
            inputSchema: {},
            outputSchema: PingResponseSchema.shape,
        },
        async () => {
            try {
                const ping = await MiscService.ping();
                return toolOk(ping);
            } catch (error) {
                return toolErr(error);
            }
        }
    );
}
