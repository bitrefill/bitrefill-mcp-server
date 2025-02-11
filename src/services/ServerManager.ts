import Logger from '../utils/logger';
import { McpServerManager } from './mcp/manager/McpServerManager';
import { TransportConfig } from './mcp/shared/types';

export class ServerManager {
  private isRunning = false;
  private readonly MODULE = 'ServerManager';
  private mcpManager: McpServerManager;

  constructor(transportConfig: TransportConfig = { type: 'stdio' }) {
    Logger.info('Initializing server manager', { module: this.MODULE });
    this.mcpManager = new McpServerManager(transportConfig);
  }

  public async start(): Promise<void> {
    Logger.debug('Attempting to start server', { 
      module: this.MODULE, 
      method: 'start',
      currentState: this.isRunning 
    });

    if (this.isRunning) {
      Logger.warn('Server already running, start operation ignored', { 
        module: this.MODULE, 
        method: 'start' 
      });
      return;
    }

    try {
      await this.mcpManager.start();
      this.isRunning = true;
      Logger.info('Server started successfully', { 
        module: this.MODULE, 
        method: 'start' 
      });
    } catch (error) {
      Logger.error('Failed to start server', error as Error, { 
        module: this.MODULE, 
        method: 'start' 
      });
      throw error;
    }
  }

  public async stop(): Promise<void> {
    Logger.debug('Attempting to stop server', { 
      module: this.MODULE, 
      method: 'stop',
      currentState: this.isRunning 
    });

    if (!this.isRunning) {
      Logger.warn('Server not running, stop operation ignored', { 
        module: this.MODULE, 
        method: 'stop' 
      });
      return;
    }

    try {
      await this.mcpManager.stop();
      this.isRunning = false;
      Logger.info('Server stopped successfully', { 
        module: this.MODULE, 
        method: 'stop' 
      });
    } catch (error) {
      Logger.error('Failed to stop server', error as Error, { 
        module: this.MODULE, 
        method: 'stop' 
      });
      throw error;
    }
  }

  public async toggle(): Promise<void> {
    Logger.debug('Toggling server state', { 
      module: this.MODULE, 
      method: 'toggle',
      currentState: this.isRunning 
    });

    try {
      if (this.isRunning) {
        await this.stop();
      } else {
        await this.start();
      }
    } catch (error) {
      Logger.error('Failed to toggle server state', error as Error, { 
        module: this.MODULE, 
        method: 'toggle' 
      });
      throw error;
    }
  }

  public getStatus(): { 
    isRunning: boolean;
    mcp: Record<string, boolean>;
  } {
    return {
      isRunning: this.isRunning,
      mcp: this.mcpManager.getStatus()
    };
  }

  public async toggleMcpServer(id: string): Promise<void> {
    Logger.debug('Toggling MCP server', {
      module: this.MODULE,
      method: 'toggleMcpServer',
      server: id
    });

    try {
      await this.mcpManager.toggleServer(id);
    } catch (error) {
      Logger.error('Failed to toggle MCP server', error as Error, {
        module: this.MODULE,
        method: 'toggleMcpServer',
        server: id
      });
      throw error;
    }
  }

  public async cleanup(): Promise<void> {
    Logger.info('Starting server cleanup', { 
      module: this.MODULE, 
      method: 'cleanup',
      currentState: this.isRunning 
    });

    if (this.isRunning) {
      await this.stop();
    }

    Logger.info('Server cleanup completed', { 
      module: this.MODULE, 
      method: 'cleanup' 
    });
  }
} 