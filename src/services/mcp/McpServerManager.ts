import Logger from "../../utils/logger";
import { NotesServer } from "./NotesServer";
import { TimerServer } from "./TimerServer";

export class McpServerManager {
  private notesServer: NotesServer;
  private timerServer: TimerServer;
  private readonly MODULE = 'McpServerManager';

  constructor() {
    this.notesServer = new NotesServer();
    this.timerServer = new TimerServer();
    Logger.info('MCP server manager initialized', { module: this.MODULE });
  }

  public async start(): Promise<void> {
    Logger.debug('Starting MCP servers', { module: this.MODULE });

    try {
      await Promise.all([
        this.notesServer.start(),
        this.timerServer.start()
      ]);
      Logger.info('All MCP servers started successfully', { module: this.MODULE });
    } catch (error) {
      Logger.error('Failed to start MCP servers', error as Error, { module: this.MODULE });
      throw error;
    }
  }

  public stop(): void {
    Logger.debug('Stopping MCP servers', { module: this.MODULE });

    try {
      this.notesServer.stop();
      this.timerServer.stop();
      Logger.info('All MCP servers stopped successfully', { module: this.MODULE });
    } catch (error) {
      Logger.error('Failed to stop MCP servers', error as Error, { module: this.MODULE });
      throw error;
    }
  }

  public getStatus(): { notes: boolean; timer: boolean } {
    return {
      notes: this.notesServer.isRunning(),
      timer: this.timerServer.isRunning()
    };
  }

  public toggleServer(server: 'notes' | 'timer'): void {
    Logger.debug('Toggling MCP server', { module: this.MODULE, server });

    try {
      if (server === 'notes') {
        if (this.notesServer.isRunning()) {
          this.notesServer.stop();
        } else {
          this.notesServer.start();
        }
      } else {
        if (this.timerServer.isRunning()) {
          this.timerServer.stop();
        } else {
          this.timerServer.start();
        }
      }
      Logger.info('MCP server toggled successfully', { module: this.MODULE, server });
    } catch (error) {
      Logger.error('Failed to toggle MCP server', error as Error, { module: this.MODULE, server });
      throw error;
    }
  }
} 