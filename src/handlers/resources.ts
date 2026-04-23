import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { ResourceTemplate, type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { productCategories } from '../constants/categories.js';
import { paymentMethods } from '../constants/payment_methods.js';

type ProductType = keyof typeof productCategories;

function isProductType(value: unknown): value is ProductType {
    return typeof value === 'string' && Object.prototype.hasOwnProperty.call(productCategories, value);
}

/**
 * Register resource handlers with the server
 * @param server - MCP server instance
 */
export function registerResourceHandlers(server: McpServer): void {
    /**
     * Static resource for payment methods
     * Exposes all available payment methods
     */
    server.registerResource(
        'payment-methods',
        'bitrefill://payment-methods',
        {
            title: 'Payment methods',
            description: 'All payment methods accepted by Bitrefill',
            mimeType: 'application/json',
        },
        async (uri) => ({
            contents: [
                {
                    uri: uri.href,
                    mimeType: 'application/json',
                    text: JSON.stringify(paymentMethods, null, 2),
                },
            ],
        })
    );

    /**
     * Static resource for product types
     * Exposes all available product types
     */
    server.registerResource(
        'product-types',
        'bitrefill://product-types',
        {
            title: 'Product types',
            description: 'List of product type keys (e.g. gift cards, mobile top-up)',
            mimeType: 'application/json',
        },
        async (uri) => ({
            contents: [
                {
                    uri: uri.href,
                    mimeType: 'application/json',
                    text: JSON.stringify(
                        {
                            productTypes: Object.keys(productCategories),
                        },
                        null,
                        2
                    ),
                },
            ],
        })
    );

    /**
     * Dynamic resource for categories of a specific product type
     * Returns categories for the requested product type
     */
    server.registerResource(
        'product-categories',
        new ResourceTemplate('bitrefill://product-types/{productType}', {
            list: async () => ({
                resources: Object.keys(productCategories).map((type) => ({
                    uri: `bitrefill://product-types/${type}`,
                    name: type,
                })),
            }),
        }),
        {
            title: 'Product categories by type',
            description: 'Categories available for a given product type (URI template)',
            mimeType: 'application/json',
        },
        async (uri, { productType }) => {
            if (!isProductType(productType)) {
                throw new McpError(
                    ErrorCode.InvalidRequest,
                    `Invalid product type: ${String(productType)}`
                );
            }

            return {
                contents: [
                    {
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(
                            {
                                productType,
                                categories: productCategories[productType],
                            },
                            null,
                            2
                        ),
                    },
                ],
            };
        }
    );
}
