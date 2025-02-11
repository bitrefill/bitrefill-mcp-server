import Logger from "../../../utils/logger";
import { serverRegistry } from "../config/serverRegistry";
import { IMcpServerInstance, TransportConfig, SSETransportConfig } from "../shared/types";
import { ExpressServer } from "../ExpressServer";

export class McpServerManager {
  private servers = new Map<string, IMcpServerInstance>();
  private expressServer: ExpressServer | null = null;
  private isRunning = false;
  private readonly MODULE = 'McpServerManager';

  constructor(private transportConfig: TransportConfig) {
    // Initialize Express server if using SSE transport
    if (transportConfig.type === 'sse') {
      this.expressServer = new ExpressServer(transportConfig.port);
      // Extend transport config with getTransport function
      (transportConfig as SSETransportConfig).getTransport = (serverId: string) => 
        this.expressServer?.getTransport(serverId);
    }
    this.initialize();
  }

  private initialize(): void {
    Logger.info('Initializing MCP servers', { module: this.MODULE });
    
    for (const config of serverRegistry) {
      try {
        const instance = config.createInstance();
        this.servers.set(config.id, instance);
        Logger.info(`Initialized MCP server: ${config.id}`, { module: this.MODULE });
      } catch (error) {
        Logger.error(`Failed to initialize MCP server: ${config.id}`, error as Error, { module: this.MODULE });
      }
    }
  }

  public async start(): Promise<void> {
    // Start Express server first if using SSE
    if (this.transportConfig.type === 'sse' && this.expressServer) {
      await this.expressServer.start();
    }

    if (this.isRunning) {
      Logger.warn('MCP servers already running', { module: this.MODULE });
      return;
    }

    try {
      const startPromises = Array.from(this.servers.entries()).map(async ([id, server]) => {
        try {
          await server.start(this.transportConfig);
          Logger.info(`Started MCP server: ${id}`, { module: this.MODULE });
        } catch (error) {
          Logger.error(`Failed to start MCP server: ${id}`, error as Error, { module: this.MODULE });
        }
      });

      await Promise.all(startPromises);
      this.isRunning = true;
      Logger.info('All MCP servers started', { module: this.MODULE });
    } catch (error) {
      Logger.error('Failed to start MCP servers', error as Error, { module: this.MODULE });
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      Logger.warn('MCP servers not running', { module: this.MODULE });
      return;
    }

    try {
      const stopPromises = Array.from(this.servers.entries()).map(async ([id, server]) => {
        try {
          await server.stop();
          Logger.info(`Stopped MCP server: ${id}`, { module: this.MODULE });
        } catch (error) {
          Logger.error(`Failed to stop MCP server: ${id}`, error as Error, { module: this.MODULE });
        }
      });

      await Promise.all(stopPromises);
      this.isRunning = false;
      Logger.info('All MCP servers stopped', { module: this.MODULE });
    } catch (error) {
      Logger.error('Failed to stop MCP servers', error as Error, { module: this.MODULE });
      throw error;
    }

    // Then stop Express server if it exists
    if (this.expressServer) {
      this.expressServer.stop();
    }
  }

  public async toggleServer(id: string): Promise<void> {
    const server = this.servers.get(id);
    if (!server) {
      Logger.warn(`Server ${id} not found`, { module: this.MODULE });
      return;
    }

    try {
      if (server.isRunning()) {
        await server.stop();
      } else {
        await server.start(this.transportConfig);
      }
      Logger.info(`Toggled MCP server: ${id}`, { module: this.MODULE });
    } catch (error) {
      Logger.error(`Failed to toggle MCP server: ${id}`, error as Error, { module: this.MODULE });
      throw error;
    }
  }

  public getStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    for (const [id, server] of this.servers) {
      status[id] = server.isRunning();
    }
    return status;
  }
} 