/** Bitrefill API v2 over MCP (stdio). Needs BITREFILL_API_KEY. Zod in; raw JSON out. */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerResourceHandlers } from './handlers/resources.js';
import { registerToolHandlers } from './handlers/tools.js';
import { logError } from './utils/index.js';
import { MiscService } from './services/misc.js';
import dotenv from 'dotenv';

dotenv.config();

if (!MiscService.isAvailable()) {
    console.error(
        '[bitrefill-mcp-server] BITREFILL_API_KEY is not set. Create an API key at https://www.bitrefill.com/account/developers and set BITREFILL_API_KEY in the environment.'
    );
}

const server = new McpServer({
    name: 'bitrefill-mcp-server',
    version: '1.0.0',
});

function registerHandlers(): void {
    registerResourceHandlers(server);
    registerToolHandlers(server);
}

async function main(): Promise<void> {
    registerHandlers();

    const transport = new StdioServerTransport();
    await server.connect(transport);

    server.server.onerror = (error) => {
        logError(error as Error, 'Server Error');
    };

    process.on('SIGINT', async () => {
        try {
            await server.close();
        } catch (error) {
            logError(error as Error, 'Shutdown');
        } finally {
            process.exit(0);
        }
    });
}

main().catch((error) => {
    logError(error as Error, 'Startup');
    process.exit(1);
});
