import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { ResourceTemplate, type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { productCategories, categorySlugs } from '../constants/categories.js';
import { paymentMethods } from '../constants/payment_methods.js';

type ProductType = keyof typeof productCategories;

function isProductType(value: unknown): value is ProductType {
    return typeof value === 'string' && Object.prototype.hasOwnProperty.call(productCategories, value);
}

export function registerResourceHandlers(server: McpServer): void {
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

    server.registerResource(
        'category-slugs',
        'bitrefill://category-slugs',
        {
            title: 'B2B category slugs',
            description: 'Valid `category` filter values (comma-separated) for GET /products and GET /products/search',
            mimeType: 'application/json',
        },
        async (uri) => ({
            contents: [
                {
                    uri: uri.href,
                    mimeType: 'application/json',
                    text: JSON.stringify({ categories: [...categorySlugs] }, null, 2),
                },
            ],
        })
    );

    server.registerResource(
        'product-types',
        'bitrefill://product-types',
        {
            title: 'Product types',
            description: 'High-level product families mapped to B2B category slugs (gift_card, esim, phone_refill, …)',
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
