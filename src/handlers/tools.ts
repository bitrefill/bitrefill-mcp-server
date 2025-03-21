import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SearchOptions } from "../schemas/search.js";
import { SearchService } from "../services/search.js";
import { ProductService } from "../services/products.js";
import { productCategories } from "../constants/categories.js";
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
            { type: "text", text: JSON.stringify(searchResults, null, 2) },
          ],
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
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
            { type: "text", text: JSON.stringify(productDetail, null, 2) },
          ],
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
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
          { type: "text", text: JSON.stringify(productCategories, null, 2) },
        ],
      };
    }
  );
}
