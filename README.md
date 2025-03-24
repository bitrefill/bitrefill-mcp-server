# Bitrefill MCP Server
[![smithery badge](https://smithery.ai/badge/@bitrefill/bitrefill-mcp-server)](https://smithery.ai/server/@bitrefill/bitrefill-mcp-server)

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
├── schemas/                # Data validation schemas
│   ├── detail.ts           # Product detail response types
│   └── search.ts           # Search parameters and response types
├── services/               # API services
│   ├── products.ts         # Product details service
│   └── search.ts           # Search functionality
└── utils/                  # Utility functions
    └── index.ts            # Error logging, etc.
```

## Features

### Resources
- `bitrefill://product-types` - List of available product types on Bitrefill
- `bitrefill://categories/{type}` - List of available categories for a specific product type (e.g., `bitrefill://categories/gift-cards`)

### Tools
- `search` - Search for gift cards, esims, mobile topups and more
  - Required: `query` (e.g., 'Amazon', 'Netflix', 'AT&T' or '*' for all)
  - Optional: `country`, `language`, `limit`, `skip`, `category`
  
- `detail` - Get detailed information about a product
  - Required: `id` (product identifier)

- `categories` - Get the full product type/categories map
  - No required parameters

- `create_invoice` - Create a new invoice for purchasing products (requires API key)
  - Required: `products` (array of products to include in the invoice)
    - Each product requires: `product_id`
    - Optional product fields: `quantity`, `value`, `package_id`, `phone_number`, `email`, `send_email`, `send_sms`
  - Required: `payment_method` (one of: "balance", "bitcoin", "lightning")
  - Optional: `webhook_url`, `auto_pay`

## Configuration

### API Key Setup

To use the `create_invoice` tool, you need to set up Bitrefill API credentials:

1. Create a `.env` file in the root directory (you can copy from `.env.example`)
2. Add your Bitrefill API credentials:
   ```
   BITREFILL_API_SECRET=your_api_key_here
   BITREFILL_API_ID=your_api_id_here
   ```

The `create_invoice` tool will only be available if the API credentials are set. If the API credentials are not set, the tool will not be registered and won't appear in the list of available tools.

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

## Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.

## Testing Services

A test utility is included to test the Bitrefill services without running the full MCP server. This is useful for development and debugging purposes.

```bash
npm run test-services help
```

The utility supports the following commands:

- `search`: Search for products
  ```bash
  npm run test-services search "Amazon" --country=US --limit=5
  ```

- `detail`: Get product details
  ```bash
  npm run test-services detail amazon_com-usa
  ```

- `categories`: List product categories
  ```bash
  npm run test-services categories
  ```

- `invoice`: Create an invoice (requires API credentials)
  ```bash
  npm run test-services invoice --product=amazon_com-usa --value=25 --payment=bitcoin
  ```

## Installation

### Installing via Smithery

To install Bitrefill for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@bitrefill/bitrefill-mcp-server):

```bash
npx -y @smithery/cli install @bitrefill/bitrefill-mcp-server --client claude
```

### Claude Desktop

Add the server config at:
- MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "bitrefill": {
      "command": "npx",
      "args": ["-y", "bitrefill-mcp-server"],
      "env": {
        "BITREFILL_API_SECRET": "your_api_key_here",
        "BITREFILL_API_ID": "your_api_id_here"
      }
    }
  }
}
```

### Cline

1. Open the Cline extension settings
2. Open "MCP Servers" tab
3. Click on "Configure MCP Servers"
4. Add the server config:

```json
{
  "mcpServers": {
    "github.com/bitrefill/bitrefill-mcp-server": {
      "command": "npx",
      "args": ["-y", "bitrefill-mcp-server"],
      "disabled": false,
      "autoApprove": ["search", "detail", "categories"],
      "env": {
        "BITREFILL_API_SECRET": "your_api_key_here",
        "BITREFILL_API_ID": "your_api_id_here"
      }
    }
  }
}
```

Additional Cline configuration options:
- `disabled`: Set to `false` to enable the server
- `autoApprove`: List of tools that don't require explicit approval for each use

### Cursor

1. Open the Cursor settings
2. Open "Features" settings
3. In the "MCP Servers" section, click on "Add new MCP Server"
4. Choose a name, and select "command" as "Type"
5. In the "Command" field, enter the following:

```
npx -y bitrefill-mcp-server
```

6. (Optional) If you're using the `create_invoice` tool, add environment variables:
   - BITREFILL_API_SECRET: your_api_key_here
   - BITREFILL_API_ID: your_api_id_here

### Docker

You can also run the server using Docker. First, build the image:

```bash
docker build -t bitrefill-mcp-server .
```

Then run the container:

```bash
docker run -e BITREFILL_API_SECRET=your_api_key_here -e BITREFILL_API_ID=your_api_id_here bitrefill-mcp-server
```

For development, you might want to mount your source code as a volume:

```bash
docker run -v $(pwd):/app --env-file .env bitrefill-mcp-server
```
