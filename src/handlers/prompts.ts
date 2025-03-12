import { GetPromptRequestSchema, ListPromptsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";

/**
 * Register prompt handlers with the server
 * @param server - MCP server instance
 */
export function registerPromptHandlers(server: Server): void {
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
}
