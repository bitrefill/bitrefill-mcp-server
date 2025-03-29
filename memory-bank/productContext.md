# Product Context: Bitrefill MCP Server

## 1. Problem Solved

AI assistants and automated systems lack a standardized way to interact with Bitrefill's services (searching products, getting details, creating invoices). This server bridges that gap, enabling programmatic access to Bitrefill's offerings.

## 2. How It Works

The server exposes specific functionalities of the Bitrefill API through the Model Context Protocol (MCP). Clients (like AI assistants) can call defined MCP tools (e.g., `search_products`, `get_product_details`, `create_invoice`) with appropriate parameters. The server translates these calls into Bitrefill API requests, processes the responses, and returns the results in a structured format suitable for the client.

## 3. User Experience Goals

- **Discoverability:** Tools and resources should be clearly named and described.
- **Reliability:** The server should handle Bitrefill API interactions robustly, including error handling.
- **Simplicity:** Input schemas for tools should be straightforward and easy to use.
- **Efficiency:** Provide necessary information without overwhelming the client.
