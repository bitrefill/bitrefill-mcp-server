import { ListResourcesRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { productCategories } from "../constants/categories.js";

/**
 * Register resource handlers with the server
 * @param server - MCP server instance
 */
export function registerResourceHandlers(server: Server): void {
  /**
   * Handler for listing available resources.
   * Exposes product categories as a resource.
   */
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: `bitrefill://categories`,
          mimeType: "application/json",
          name: "Product Categories",
          description: "List of available product categories on Bitrefill"
        }
      ]
    };
  });

  /**
   * Handler for reading resources.
   * Returns product categories when requested.
   */
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri !== "bitrefill://categories") {
      throw new Error(`Resource not found: ${request.params.uri}`);
    }

    return {
      contents: [{
        uri: request.params.uri,
        mimeType: "application/json",
        text: JSON.stringify({ categories: productCategories }, null, 2)
      }]
    };
  });
}
