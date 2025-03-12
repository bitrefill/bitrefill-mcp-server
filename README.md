# Bitrefill MCP Server

A TypeScript-based MCP server that provides access to Bitrefill services, allowing you to search for gift cards, mobile topups, and more. This server implements the Model Context Protocol to expose Bitrefill functionality to AI assistants.

## How It Works

The server operates using the Model Context Protocol (MCP) to communicate with Claude and similar AI assistants. It:

1. Runs as a standalone process using stdio for communication
2. Registers resources and tools for accessing Bitrefill services
3. Interfaces with the Bitrefill API to provide product search and details
4. Returns structured JSON responses that can be processed by AI assistants

### Architecture

The app server follows this architecture:

```
src/
├── index.ts                # Main entry point
├── constants/              # Static data
│   └── categories.ts       # Product categories
├── handlers/               # MCP request handlers
│   ├── resources.ts        # Resource endpoints
│   └── tools.ts            # Tool implementations
├── services/               # API services
│   ├── products.ts         # Product details service
│   └── search.ts           # Search functionality
├── types/                  # TypeScript definitions
│   └── index.ts            # Types for API responses
└── utils/                  # Utility functions
    └── index.ts            # Error logging, etc.
```

## Features

### Resources
- `bitrefill://categories` - List available product categories on Bitrefill

### Tools
- `search` - Search for gift cards, esims, mobile topups and more
  - Required: `query` (e.g., 'Amazon', 'Netflix', 'AT&T' or '*' for all)
  - Optional: `country`, `language`, `limit`, `skip`, `category`
  
- `detail` - Get detailed information about a product
  - Required: `id` (product identifier)

- `categories` - Get the full product type/categories map
  - No required parameters

## Development

Install dependencies:
```bash
npm install
```

Build the server:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "bitrefill": {
      "command": "node /path/to/bitrefill-mcp/build/index.js"
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
