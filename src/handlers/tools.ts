import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SearchOptions } from "../types/index.js";
import { SearchService } from "../services/search.js";
import { ProductService } from "../services/products.js";

/**
 * Register tool handlers with the server
 * @param server - MCP server instance
 */
export function registerToolHandlers(server: Server): void {
  /**
   * Handler that lists available tools.
   * Exposes three tools: search, detail, and order.
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "search",
          description: "Search for gift cards, esims, mobile topups and more",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description:
                  "Search query (e.g., 'Amazon', 'Netflix', 'AT&T' or '*' for all)",
              },
              country: {
                type: "string",
                description: "Country code (e.g., 'US', 'IT', 'GB')",
              },
              language: {
                type: "string",
                description: "Language code for results (e.g., 'en')",
              },
              limit: {
                type: "number",
                description: "Maximum number of results to return",
              },
              skip: {
                type: "number",
                description: "Number of results to skip (for pagination)",
              },
              category: {
                type: "string",
                description:
                  "Filter by category (e.g., 'gaming', 'entertainment')",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "detail",
          description: "Get detailed information about a product",
          inputSchema: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Product ID",
              },
            },
            required: ["id"],
          },
        },
      ],
    };
  });

  /**
   * Handler for the Bitrefill tools.
   * Redirects to appropriate service based on the tool name.
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
      case "search": {
        const query = String(request.params.arguments?.query || "");
        // Type cast the arguments to their expected types
        const options: Partial<SearchOptions> = {};

        if (request.params.arguments?.country !== undefined)
          options.country = String(request.params.arguments.country);

        if (request.params.arguments?.language !== undefined)
          options.language = String(request.params.arguments.language);

        if (request.params.arguments?.limit !== undefined)
          options.limit = Number(request.params.arguments.limit);

        if (request.params.arguments?.skip !== undefined)
          options.skip = Number(request.params.arguments.skip);

        if (request.params.arguments?.category !== undefined)
          options.category = String(request.params.arguments.category);

        if (request.params.arguments?.beta_flags !== undefined)
          options.beta_flags = String(request.params.arguments.beta_flags);

        if (request.params.arguments?.cart !== undefined)
          options.cart = String(request.params.arguments.cart);

        if (request.params.arguments?.do_recommend !== undefined)
          options.do_recommend = Number(request.params.arguments.do_recommend);

        if (request.params.arguments?.rec !== undefined)
          options.rec = Number(request.params.arguments.rec);

        if (request.params.arguments?.sec !== undefined)
          options.sec = Number(request.params.arguments.sec);

        if (request.params.arguments?.col !== undefined)
          options.col = Number(request.params.arguments.col);

        if (request.params.arguments?.prefcc !== undefined)
          options.prefcc = Number(request.params.arguments.prefcc);

        if (request.params.arguments?.src !== undefined)
          options.src = String(request.params.arguments.src);

        const searchResults = await SearchService.search(query, options);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(searchResults, null, 2),
            },
          ],
        };
      }

      case "detail": {
        const id = String(request.params.arguments?.id || "");
        const productDetail = ProductService.getProductDetails(id);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(productDetail, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error("Unknown tool");
    }
  });
}
