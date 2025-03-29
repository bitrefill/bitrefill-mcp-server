# Project Brief: Bitrefill MCP Server

## 1. Project Goal

To create and maintain a Model Context Protocol (MCP) server that provides tools and resources for interacting with Bitrefill's services. This server allows AI assistants like Cline to programmatically access Bitrefill functionalities.

## 2. Core Requirements

The server must provide capabilities to:
- Search for Bitrefill products (gift cards, mobile topups).
- Retrieve detailed information about specific products.
- Browse available product categories.
- Initiate the purchase process by creating invoices.

## 3. Target Users

AI assistants and developers integrating Bitrefill services into automated workflows or conversational interfaces.

## 4. Scope

- **In Scope:** Implementing MCP tools and potentially resources corresponding to the core requirements. Handling API interactions with Bitrefill. Basic error handling and logging.
- **Out of Scope:** User interface, direct user authentication management (relies on API keys/tokens provided via environment variables), payment processing completion (invoice creation only).

## 5. Key Technologies

- TypeScript
- Node.js
- `@modelcontextprotocol/sdk`
- Bitrefill API (assumed)
- `dotenv` for environment variable management
