import Logger from '../utils/logger';
import { McpServerManager } from './mcp/McpServerManager';

export class ServerManager {
  private isRunning = false;
  private readonly MODULE = 'ServerManager';
  private mcpManager: McpServerManager;

  constructor() {
    Logger.info('Initializing server manager', { module: this.MODULE });
    this.mcpManager = new McpServerManager();
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

  public stop(): void {
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
      this.mcpManager.stop();
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

  public toggle(): void {
    Logger.debug('Toggling server state', { 
      module: this.MODULE, 
      method: 'toggle',
      currentState: this.isRunning 
    });

    try {
      if (this.isRunning) {
        this.stop();
      } else {
        this.start();
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
    mcp: { notes: boolean; timer: boolean; }
  } {
    Logger.debug('Getting server status', { 
      module: this.MODULE, 
      method: 'getStatus',
      status: this.isRunning 
    });
    return {
      isRunning: this.isRunning,
      mcp: this.mcpManager.getStatus()
    };
  }

  public toggleMcpServer(server: 'notes' | 'timer'): void {
    Logger.debug('Toggling MCP server', {
      module: this.MODULE,
      method: 'toggleMcpServer',
      server
    });

    try {
      this.mcpManager.toggleServer(server);
    } catch (error) {
      Logger.error('Failed to toggle MCP server', error as Error, {
        module: this.MODULE,
        method: 'toggleMcpServer',
        server
      });
      throw error;
    }
  }

  public cleanup(): void {
    Logger.info('Starting server cleanup', { 
      module: this.MODULE, 
      method: 'cleanup',
      currentState: this.isRunning 
    });

    if (this.isRunning) {
      this.stop();
    }

    Logger.info('Server cleanup completed', { 
      module: this.MODULE, 
      method: 'cleanup' 
    });
  }
} 