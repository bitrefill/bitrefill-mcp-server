# Technical Context: Bitrefill MCP Server

## 1. Technologies Used

- **Language:** TypeScript (compiled to JavaScript)
- **Runtime:** Node.js
- **Core Framework:** `@modelcontextprotocol/sdk`
- **Environment Variables:** `dotenv` library for loading `.env` files.
- **API Client:** Likely `axios` or `node-fetch` (needs confirmation, assumed within `utils/api.ts`).
- **Build System:** `tsc` (TypeScript Compiler) based on `tsconfig.json`.
- **Package Manager:** `npm` (inferred from `package.json`, `package-lock.json`).

## 2. Development Setup

- **Prerequisites:** Node.js, npm.
- **Installation:** `npm install`
- **Configuration:** Requires a `.env` file with Bitrefill API credentials (e.g., `BITREFILL_API_KEY`, `BITREFILL_API_SECRET` - *exact names need confirmation*). An `.env.example` file exists.
- **Building:** `npm run build` (compiles TypeScript to JavaScript in `build/` directory, based on standard `tsc` setup).
- **Running:** `node build/index.js` or potentially via an `npm start` script (needs confirmation from `package.json`).

## 3. Technical Constraints

- Operates in a non-interactive environment (Stdio transport).
- Relies on environment variables for sensitive credentials (API keys).
- Must adhere to the MCP specification for communication.
- Dependent on the availability and rate limits of the Bitrefill API.

## 4. Key Dependencies (Inferred)

- `@modelcontextprotocol/sdk`: Core MCP functionality.
- `dotenv`: Environment variable loading.
- `typescript`: Language support.
- `@types/node`: Node.js type definitions.
- Potentially `axios` or `node-fetch` for HTTP requests.
- Potentially a schema validation library (e.g., `zod`, `joi`).

*(Note: Dependency list should be verified against `package.json`)*
