import { ErrorCode, ListResourcesRequestSchema, McpError, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { productCategories } from "../constants/categories.js";

// Type for product types to help TypeScript understand valid keys
type ProductType = keyof typeof productCategories;

/**
 * Register resource handlers with the server
 * @param server - MCP server instance
 */
export function registerResourceHandlers(server: Server): void {
  /**
   * Handler for listing available resources.
   * Exposes product types and categories as resources.
   */
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    // Create a list of resources for product types and their categories
    const resources = [
      {
        uri: `bitrefill://product-types`,
        mimeType: "application/json",
        name: "Product Types",
        description: "List of available product types on Bitrefill"
      }
    ];

    // Add resources for categories of each product type
    Object.keys(productCategories).forEach(type => {
      resources.push({
        uri: `bitrefill://categories/${type}`,
        mimeType: "application/json",
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Categories`,
        description: `List of available categories for ${type} on Bitrefill`
      });
    });

    return { resources };
  });

  /**
   * Handler for reading resources.
   * Returns product types or categories for a specific type when requested.
   */
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    
    // Handle request for all product types
    if (uri === "bitrefill://product-types") {
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify({ 
            productTypes: Object.keys(productCategories) 
          }, null, 2)
        }]
      };
    }
    
    // Handle request for categories of a specific product type
    const categoryMatch = uri.match(/^bitrefill:\/\/categories\/([a-z-]+)$/);
    if (categoryMatch) {
      const productType = categoryMatch[1];
      
      // Check if the product type is valid
      if (!Object.keys(productCategories).includes(productType)) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Invalid product type: ${productType}`
        );
      }
      
      // Now TypeScript knows productType is a valid key
      const typedProductType = productType as ProductType;
      
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify({ 
            productType,
            categories: productCategories[typedProductType]
          }, null, 2)
        }]
      };
    }
    
    // If URI doesn't match any pattern, throw an error
    throw new McpError(
      ErrorCode.InvalidRequest,
      `Resource not found: ${uri}`
    );
  });
}
