#!/usr/bin/env node

/**
 * Bitrefill MCP Server
 * 
 * This MCP server provides tools for interacting with Bitrefill services:
 * - Search for gift cards and mobile topups
 * - Get detailed product information
 * - Create orders with cryptocurrency payments
 * - List products by country
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Product categories available on Bitrefill
 */
const productCategories = [
  "Gift Cards",
  "Gaming",
  "Mobile Topup",
  "Electronics",
  "Travel",
  "Food & Dining",
  "Entertainment",
  "Utilities"
];

/**
 * Create an MCP server with capabilities for resources (product categories),
 * tools (search, detail, order), and prompts (products by country).
 */
const server = new Server(
  {
    name: "bitrefill-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

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
 * Returns static JSON responses for each tool.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "search": {
      const query = String(request.params.arguments?.query || "");
      
      // Static search response
      const searchResults = {
        results: [
          { id: "amazon-us", name: "Amazon US", type: "Gift Card" },
          { id: "steam", name: "Steam", type: "Gaming" },
          { id: "att-prepaid", name: "AT&T Prepaid", type: "Mobile Topup" },
          { id: "netflix", name: "Netflix", type: "Entertainment" },
          { id: "uber", name: "Uber", type: "Travel" }
        ]
      };

      return {
        content: [{
          type: "text",
          text: JSON.stringify(searchResults, null, 2)
        }]
      };
    }

    case "detail": {
      const id = String(request.params.arguments?.id || "");
      
      // Static product detail response
      const productDetail = {
        id: id,
        name: id === "amazon-us" ? "Amazon US Gift Card" : 
             id === "steam" ? "Steam Gift Card" : 
             id === "att-prepaid" ? "AT&T Prepaid" : 
             id === "netflix" ? "Netflix Gift Card" : 
             id === "uber" ? "Uber Gift Card" : "Unknown Product",
        description: "Use this digital code to shop for millions of items at competitive prices",
        denominations: [25, 50, 100, 200],
        country: "United States",
        category: id === "amazon-us" ? "Gift Cards" : 
                 id === "steam" ? "Gaming" : 
                 id === "att-prepaid" ? "Mobile Topup" : 
                 id === "netflix" ? "Entertainment" : 
                 id === "uber" ? "Travel" : "Unknown"
      };

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
      
      // Static order response
      const orderResponse = {
        order_id: `ord_${Math.floor(Math.random() * 100000)}`,
        product: product,
        amount_usd: denomination,
        payment_address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        amount_btc: (denomination * 0.000025).toFixed(8),
        expires_in: "15 minutes"
      };

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

/**
 * Handler that lists available prompts.
 * Exposes a "products_by_country" prompt.
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "products_by_country",
        description: "List all products available in a specific country",
      }
    ]
  };
});

/**
 * Handler for the products_by_country prompt.
 * Returns a list of products available in the specified country.
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name !== "products_by_country") {
    throw new Error("Unknown prompt");
  }

  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "List all products available in {country}"
        }
      },
      {
        role: "assistant",
        content: {
          type: "text",
          text: "Here are products available in {country}:\n\n" +
                "1. Amazon Gift Card\n" +
                "2. Netflix\n" +
                "3. Uber\n" +
                "4. Local Mobile Topup Providers\n" +
                "5. Steam\n" +
                "6. PlayStation Store"
        }
      }
    ]
  };
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
