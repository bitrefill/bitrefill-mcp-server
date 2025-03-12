import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SearchService } from "../services/search.js";
import { ProductService } from "../services/products.js";
import { OrderService } from "../services/orders.js";

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
          description: "Search for gift cards and mobile topups",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query (e.g., 'Amazon', 'Netflix', 'AT&T')"
              }
            },
            required: ["query"]
          }
        },
        {
          name: "detail",
          description: "Get detailed information about a product",
          inputSchema: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Product ID"
              }
            },
            required: ["id"]
          }
        },
        {
          name: "order",
          description: "Create an order with cryptocurrency payment",
          inputSchema: {
            type: "object",
            properties: {
              product: {
                type: "string",
                description: "Product ID"
              },
              denomination: {
                type: "number",
                description: "Amount/denomination to purchase"
              }
            },
            required: ["product", "denomination"]
          }
        }
      ]
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
        const searchResults = SearchService.search(query);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(searchResults, null, 2)
          }]
        };
      }

      case "detail": {
        const id = String(request.params.arguments?.id || "");
        const productDetail = ProductService.getProductDetails(id);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(productDetail, null, 2)
          }]
        };
      }

      case "order": {
        const product = String(request.params.arguments?.product || "");
        const denomination = Number(request.params.arguments?.denomination || 0);
        const orderResponse = OrderService.createOrder(product, denomination);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(orderResponse, null, 2)
          }]
        };
      }

      default:
        throw new Error("Unknown tool");
    }
  });
}
