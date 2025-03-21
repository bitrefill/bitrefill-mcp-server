import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { productCategories } from "../constants/categories.js";
import { ProductService } from "../services/products.js";

// Type for product types to help TypeScript understand valid keys
type ProductType = keyof typeof productCategories;

/**
 * Register resource handlers with the server
 * @param server - MCP server instance
 */
export function registerResourceHandlers(server: McpServer): void {
  /**
   * Static resource for product types
   * Exposes all available product types
   */
  server.resource(
    "product-types",
    "bitrefill://product-types",
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
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
  server.resource(
    "product-categories",
    new ResourceTemplate("bitrefill://product-types/{productType}", {
      list: async () => ({
        resources: Object.keys(productCategories).map((type) => ({
          uri: `bitrefill://product-types/${type}`,
          name: type,
        })),
      }),
    }),
    async (uri, { productType }) => {
      // Check if the product type is valid
      if (
        typeof productType !== "string" ||
        !Object.keys(productCategories).includes(productType)
      ) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Invalid product type: ${productType}`
        );
      }

      // Now TypeScript knows productType is a valid key
      const typedProductType = productType as ProductType;

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                productType,
                categories: productCategories[typedProductType],
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
