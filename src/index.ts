#!/usr/bin/env node

/**
 * Bitrefill MCP Server
 * 
 * This MCP server provides tools for interacting with Bitrefill services:
 * - Search for gift cards and mobile topups
 * - Get detailed product information
 * - Browse product categories
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerResourceHandlers } from "./handlers/resources.js";
import { registerToolHandlers } from "./handlers/tools.js";
import { logError } from "./utils/index.js";

/**
 * Create an MCP server with capabilities for resources and tools.
 */
const server = new McpServer(
  {
    name: "bitrefill-mcp-server",
    version: "0.2.1",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

/**
 * Register all handlers with the server.
 */
function registerHandlers(): void {
  registerResourceHandlers(server);
  registerToolHandlers(server);
}

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main(): Promise<void> {
  // Register all handlers
  registerHandlers();

  // Connect using stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Handle process termination
  process.on("SIGINT", async () => {
    try {
      await server.close();
    } catch (error) {
      logError(error as Error, "Shutdown");
    } finally {
      process.exit(0);
    }
  });
}

main().catch((error) => {
  logError(error as Error, "Startup");
  process.exit(1);
});
