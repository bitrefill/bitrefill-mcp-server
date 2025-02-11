import express, { Express, Request, Response, Router, RequestHandler } from 'express';
import { Server as HTTPServer } from 'http';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import Logger from '../../utils/logger';

type LogMetadata = {
  module: string;
  [key: string]: any;
};

export class ExpressServer {
  private app: Express;
  private server: HTTPServer | null = null;
  private readonly MODULE = 'ExpressServer';
  private readonly port;
  private transports: Map<string, SSEServerTransport> = new Map();
  private router: Router;

  constructor(port = 3000) {
    this.app = express();
    this.port = port;
    this.router = express.Router();
    this.setupMiddleware();
    this.setupRoutes();
    this.app.use(this.router);
    Logger.info('Express server initialized', { module: this.MODULE, port });
  }

  private setupMiddleware() {
    this.app.use(express.json());
  }

  private setupRoutes() {
    // SSE endpoint for each MCP server
    const handleSSE: RequestHandler = (req, res) => {
      const serverName = req.params.server;
      
      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      // Create transport
      const transport = new SSEServerTransport('/messages/' + serverName, res);
      this.transports.set(serverName, transport);
      Logger.info('SSE connection established', { module: this.MODULE, server: serverName });

      // Handle client disconnect
      req.on('close', () => {
        this.transports.delete(serverName);
        Logger.info('SSE connection closed', { module: this.MODULE, server: serverName });
      });
    };

    // Message endpoint for each MCP server
    const handleMessage: RequestHandler = async (req, res) => {
      const serverName = req.params.server;
      const transport = this.transports.get(serverName);
      
      if (!transport) {
        const metadata: LogMetadata = { module: this.MODULE, server: serverName };
        Logger.error('Transport not found for server', new Error('Transport not found'), metadata);
        res.status(404).json({ error: `Transport for server ${serverName} not found` });
        return;
      }

      try {
        await transport.handlePostMessage(req, res);
        Logger.debug('Message handled successfully', { module: this.MODULE, server: serverName });
      } catch (error) {
        const metadata: LogMetadata = { module: this.MODULE, server: serverName };
        Logger.error('Error handling message', error as Error, metadata);
        // Only send error response if headers haven't been sent yet
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    };

    this.router.get('/sse/:server', handleSSE);
    this.router.post('/messages/:server', handleMessage);
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          Logger.info('Express server started', { module: this.MODULE, port: this.port });
          resolve();
        });
      } catch (error) {
        Logger.error('Failed to start Express server', error as Error, { module: this.MODULE });
        reject(error);
      }
    });
  }

  public stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
      this.transports.clear();
      Logger.info('Express server stopped', { module: this.MODULE });
    }
  }

  public getTransport(serverName: string): SSEServerTransport | undefined {
    return this.transports.get(serverName);
  }
} 