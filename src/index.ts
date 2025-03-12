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
import { registerResourceHandlers } from "./handlers/resources.js";
import { registerToolHandlers } from "./handlers/tools.js";
import { logError } from "./utils/index.js";

/**
 * Create an MCP server with capabilities for resources, tools, and prompts.
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
  try {
    // Register all handlers
    registerHandlers();

    // Connect using stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    // Set up error handling
    server.onerror = (error) => {
      logError(error, "Server");
    };
    
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
  } catch (error) {
    logError(error as Error, "Startup");
    process.exit(1);
  }
}

main().catch((error) => {
  logError(error, "Uncaught Exception");
  process.exit(1);
});
