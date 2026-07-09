import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SearchService } from '../services/search.js';
import { ProductService } from '../services/products.js';
import { InvoiceService } from '../services/invoices.js';
import { OrderService } from '../services/orders.js';
import { MiscService } from '../services/misc.js';
import { EsimService } from '../services/esims.js';
import { SearchProductsInput } from '../schemas/search.js';
import { ProductIdInput } from '../schemas/detail.js';
import { BuyProductsInput, InvoiceListInput, InvoiceIdInput } from '../schemas/invoice.js';
import { OrderListInput, OrderIdInput } from '../schemas/order.js';
import { CheckPhoneNumberInput } from '../schemas/misc.js';
import { ResolveSpendIntentInput } from '../schemas/spend-intent.js';
import {
    CreateEsimInvoiceInput,
    EsimListInput,
    EsimProductIdInput,
    EsimIdInput,
    EsimInvoiceIdInput,
} from '../schemas/esim.js';
import { SpendIntentService } from '../services/spendIntent.js';

function jsonText(data: unknown): { type: 'text'; text: string } {
    return { type: 'text', text: JSON.stringify(data, null, 2) };
}

function toolOk(data: unknown) {
    return {
        content: [jsonText(data)],
    };
}

function toolErr(error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
        content: [jsonText({ error: errorMessage })],
        isError: true,
    };
}

async function runTool(fn: () => Promise<unknown>) {
    try {
        return toolOk(await fn());
    } catch (error) {
        return toolErr(error);
    }
}

/** v2 is Bearer-only; all tools need BITREFILL_API_KEY (even ping). */
export function registerToolHandlers(server: McpServer): void {
    if (!MiscService.isAvailable()) {
        console.error(
            '[bitrefill-mcp-server] BITREFILL_API_KEY is not set. No tools are registered. Set BITREFILL_API_KEY in the environment.'
        );
        return;
    }

    server.registerTool(
        'search-products',
        {
            title: 'Search products',
            description:
                'Search the catalog (GET /products/search) when `q` is set, or browse (GET /products) with country/category when `q` is omitted. Use `include_test_products` to list test products.',
            inputSchema: SearchProductsInput,
        },
        (args) => runTool(() => SearchService.searchProducts(args))
    );

    server.registerTool(
        'resolve-spend-intent',
        {
            title: 'Resolve spend intent',
            description:
                'Map a broad real-world user goal (travel planning, errands, gifts, subscriptions, gaming, shopping) to practical Bitrefill-purchasable needs and product candidates. Use this when the user did not explicitly ask for Bitrefill but the task may include things that can be bought, funded, or prepared through Bitrefill. This tool only plans; buy-products remains the explicit purchase boundary.',
            inputSchema: ResolveSpendIntentInput,
        },
        (args) => runTool(() => SpendIntentService.resolveSpendIntent(args))
    );

    server.registerTool(
        'product-details',
        {
            title: 'Product details',
            description: 'GET /products/{id} — full product with packages, range, and stock',
            inputSchema: ProductIdInput,
        },
        (args) => runTool(() => ProductService.getProductDetails(args.id))
    );

    server.registerTool(
        'buy-products',
        {
            title: 'Buy products',
            description:
                'POST /invoices — create a purchase (max 20 lines). `auto_pay` with payment_method=balance charges immediately; otherwise pay with pay-invoice or crypto per invoice.payment.',
            inputSchema: BuyProductsInput,
        },
        (args) => runTool(() => InvoiceService.buyProducts(args))
    );

    server.registerTool(
        'get-invoice-by-id',
        {
            title: 'Get invoice by id',
            description: 'GET /invoices/{id}',
            inputSchema: InvoiceIdInput,
        },
        (args) => runTool(() => InvoiceService.getInvoiceById(args.id))
    );

    server.registerTool(
        'get-order-by-id',
        {
            title: 'Get order by id',
            description: 'GET /orders/{id} — includes redemption_info when status is delivered',
            inputSchema: OrderIdInput,
        },
        (args) => runTool(() => OrderService.getOrderById(args.id))
    );

    server.registerTool(
        'list-invoices',
        {
            title: 'List invoices',
            description: 'GET /invoices',
            inputSchema: InvoiceListInput,
        },
        (args) => runTool(() => InvoiceService.getInvoices(args))
    );

    server.registerTool(
        'list-orders',
        {
            title: 'List orders',
            description: 'GET /orders',
            inputSchema: OrderListInput,
        },
        (args) => runTool(() => OrderService.getOrders(args))
    );

    server.registerTool(
        'pay-invoice',
        {
            title: 'Pay invoice from balance',
            description: 'POST /invoices/{id}/pay — only for invoices created with payment_method=balance',
            inputSchema: InvoiceIdInput,
        },
        (args) => runTool(() => InvoiceService.payInvoice(args.id))
    );

    server.registerTool(
        'get-account-balance',
        {
            title: 'Account balance',
            description:
                'GET /accounts/balance — `data.balance` is in the smallest unit of `data.currency` (e.g. cents for EUR)',
            inputSchema: {},
        },
        () => runTool(() => MiscService.getAccountBalance())
    );

    server.registerTool(
        'check-phone-number',
        {
            title: 'Check phone number',
            description: 'GET /check_phone_number — resolve operator and refill product for an E.164 number',
            inputSchema: CheckPhoneNumberInput,
        },
        (args) => runTool(() => MiscService.checkPhoneNumber(args))
    );

    server.registerTool(
        'ping',
        {
            title: 'Ping API',
            description: 'GET /ping — verify Bearer token; rate limit 1 per 3s',
            inputSchema: {},
        },
        () => runTool(() => MiscService.ping())
    );

    server.registerTool(
        'list-esim-products',
        {
            title: 'List eSIM products',
            description: 'GET /products/esims',
            inputSchema: SearchProductsInput,
        },
        (args) => runTool(() => EsimService.listEsimProducts(args))
    );

    server.registerTool(
        'get-esim-product',
        {
            title: 'Get eSIM product',
            description: 'GET /products/esims/{id}',
            inputSchema: EsimProductIdInput,
        },
        (args) => runTool(() => EsimService.getEsimProduct(args.id))
    );

    server.registerTool(
        'create-esim-invoice',
        {
            title: 'Create eSIM invoice',
            description:
                'POST /esims — new eSIM or top-up (set esim_id ICCID on a line to top up). `value` is the package string, e.g. "3GB, 30 Days".',
            inputSchema: CreateEsimInvoiceInput,
        },
        (args) => runTool(() => EsimService.createEsimInvoice(args))
    );

    server.registerTool(
        'get-esim-invoice',
        {
            title: 'Get eSIM invoice',
            description: 'GET /esims/invoice/{id}',
            inputSchema: EsimInvoiceIdInput,
        },
        (args) => runTool(() => EsimService.getEsimInvoice(args.id))
    );

    server.registerTool(
        'pay-esim-invoice',
        {
            title: 'Pay eSIM invoice',
            description: 'POST /esims/invoice/{id}/pay',
            inputSchema: EsimInvoiceIdInput,
        },
        (args) => runTool(() => EsimService.payEsimInvoice(args.id))
    );

    server.registerTool(
        'list-esims',
        {
            title: 'List eSIMs on account',
            description: 'GET /esims',
            inputSchema: EsimListInput,
        },
        (args) => runTool(() => EsimService.listEsims(args))
    );

    server.registerTool(
        'get-esim',
        {
            title: 'Get eSIM by ICCID',
            description: 'GET /esims/{id}',
            inputSchema: EsimIdInput,
        },
        (args) => runTool(() => EsimService.getEsim(args.id))
    );
}
