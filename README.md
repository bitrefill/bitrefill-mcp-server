# Bitrefill MCP Server (Sample Implementation)

> **This is a sample / reference implementation.** For production use, connect to the **official hosted Bitrefill eCommerce MCP** at `https://api.bitrefill.com/mcp` instead. It is maintained by Bitrefill, supports OAuth, and exposes the same tools without you having to run, deploy, or update anything.
>
> Use this repository if you want to **learn how a Bitrefill MCP can be built**, **fork it**, **extend it**, or **self-host a customized variant** on top of the [Bitrefill API v2](https://docs.bitrefill.com).

This server wraps the [Bitrefill API v2](https://docs.bitrefill.com) (`https://api.bitrefill.com/v2`) using **`Authorization: Bearer ${BITREFILL_API_KEY}`**. Only **request** parameters are validated with Zod; API responses are returned as JSON text unchanged.

## Use the official remote MCP (recommended for production)

The [Bitrefill eCommerce MCP](https://docs.bitrefill.com/docs/ecommerce-mcp) is hosted by Bitrefill and is the recommended way to integrate with ChatGPT, Claude Desktop / Code, Cursor, and any other MCP-compatible client.

- **OAuth (recommended)**. Point your client at:

  ```
  https://api.bitrefill.com/mcp
  ```

  You'll be redirected to Bitrefill to sign in and authorize access. No API key handling required.

- **API key**. Append your key from [bitrefill.com/account/developers](https://www.bitrefill.com/account/developers):

  ```
  https://api.bitrefill.com/mcp/YOUR_API_KEY
  ```

Setup guides per client: [ChatGPT](https://docs.bitrefill.com/docs/use-with-chatgpt), [Claude Desktop](https://docs.bitrefill.com/docs/use-with-claude-chat), [Claude Code](https://docs.bitrefill.com/docs/use-with-claude-code), [Cursor](https://docs.bitrefill.com/docs/use-with-cursor).

## When to use this repo instead

Run this local MCP only if you need to:

- Study a working reference implementation of a Bitrefill MCP server.
- Fork it to add custom tools, prompts, validation, logging, or routing.
- Self-host inside a private network or air-gapped environment.
- Experiment with a wider set of v2 endpoints (this sample exposes 18 tools, while the official remote MCP intentionally exposes a curated set of 7; see [eCommerce MCP](https://docs.bitrefill.com/docs/ecommerce-mcp#available-tools)).

For everyday "buy gift cards / eSIMs from my AI assistant" use cases, prefer the hosted server above.

## Configuration

1. Create an API key: [Bitrefill account → Developers](https://www.bitrefill.com/account/developers).
2. Set in the environment (or `.env` for local runs):

```bash
BITREFILL_API_KEY=your_api_key_here
```

If `BITREFILL_API_KEY` is missing, **no tools** are registered (v2 requires authentication even for `ping`).

## Tools (v1.0.0)

| Tool | API |
|------|-----|
| `search-products` | `GET /products/search` (with `q`) or `GET /products` (browse) |
| `product-details` | `GET /products/{id}` |
| `buy-products` | `POST /invoices` |
| `get-invoice-by-id` | `GET /invoices/{id}` |
| `get-order-by-id` | `GET /orders/{id}` |
| `list-invoices` | `GET /invoices` |
| `list-orders` | `GET /orders` |
| `pay-invoice` | `POST /invoices/{id}/pay` |
| `get-account-balance` | `GET /accounts/balance` |
| `check-phone-number` | `GET /check_phone_number` |
| `ping` | `GET /ping` |
| `list-esim-products` | `GET /products/esims` |
| `get-esim-product` | `GET /products/esims/{id}` |
| `create-esim-invoice` | `POST /esims` |
| `get-esim-invoice` | `GET /esims/invoice/{id}` |
| `pay-esim-invoice` | `POST /esims/invoice/{id}/pay` |
| `list-esims` | `GET /esims` |
| `get-esim` | `GET /esims/{id}` |

**Breaking change vs 0.x:** old snake_case tool names (`search`, `create_invoice`, `unseal_order`, ...) were removed. Use the names above. There is no `unseal_order` in v2; `GET /orders/{id}` returns `redemption_info` when delivered.

## Resources

- `bitrefill://payment-methods`: allowed `payment_method` strings for `buy-products` / `create-esim-invoice`
- `bitrefill://category-slugs`: B2B `category` query values for product list/search
- `bitrefill://product-types`: product family keys
- `bitrefill://product-types/{productType}`: category slugs per family

## Project layout

```
src/
  index.ts
  types/api.ts          # Optional TS shapes for API JSON (not validated at runtime)
  constants/            # payment_method list, category slugs
  handlers/             # resources.ts, tools.ts
  schemas/              # Zod: inputs only
  services/             # API calls (search, products, invoices, orders, esims, misc)
  utils/api/            # base (BitrefillApiError), authenticated (Bearer v2)
```

## Development

```bash
pnpm install
pnpm run build
pnpm run typecheck
pnpm run lint
```

### Smoke tests (this repo’s MCP only)

Smoke tests always start **this package’s** server (`node build/index.js` after `pnpm run build`). They do **not** open `https://api.bitrefill.com/mcp` or any other remote MCP URL.

**Recommended**: MCP client in-process (stdio to `build/index.js`):

```bash
pnpm run build
pnpm run smoke
```

Same as `pnpm run test-services` (alias).

**Optional**: [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) CLI, still only against **this** server:

```bash
pnpm run build
pnpm run smoke:inspector
```

**All 18 tools** (Inspector CLI, summary lines, dummy ids on purpose):

```bash
pnpm run test:inspector:all-tools
```

The Inspector uses **`--tool-arg key=value`** (repeat for multiple keys), not a single JSON blob. For nested data, use JSON in the value, e.g.  
`--tool-arg 'products=[{"product_id":"x","value":10}]'`.

Interactive UI (local server only):

```bash
pnpm run build
pnpm run inspector
```

Examples:

```bash
pnpm dlx @modelcontextprotocol/inspector node build/index.js --cli --method tools/call --tool-name ping
pnpm dlx @modelcontextprotocol/inspector node build/index.js --cli --method tools/call --tool-name product-details --tool-arg id=test-gift-card-code
```

## Client examples (self-hosted sample)

> Reminder: for production, prefer the hosted `https://api.bitrefill.com/mcp` (OAuth) over the stdio config below.

**Cursor / Claude-style MCP config**, pass the key in `env`:

```json
{
  "mcpServers": {
    "bitrefill": {
      "command": "npx",
      "args": ["-y", "bitrefill-mcp-server"],
      "env": {
        "BITREFILL_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Docker**, e.g. `-e BITREFILL_API_KEY=...` or `--env-file .env`.

**Hosted remote MCP** (no install, recommended):

```json
{
  "mcpServers": {
    "bitrefill": {
      "url": "https://api.bitrefill.com/mcp"
    }
  }
}
```

## Documentation

- [Bitrefill docs](https://docs.bitrefill.com) ([llms index](https://docs.bitrefill.com/llms.txt))
- [Bitrefill eCommerce MCP (hosted)](https://docs.bitrefill.com/docs/ecommerce-mcp): official remote server, recommended for production
- [Setup guides](https://docs.bitrefill.com/docs/setup-guides): ChatGPT, Claude, Cursor

## License

MIT
