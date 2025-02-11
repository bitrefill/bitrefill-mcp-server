import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import Logger from "../../../utils/logger";
import { TransportConfig, IMcpServerInstance } from "../shared/types";
import { ExpressServer } from "../ExpressServer";

interface Timer {
  id: string;
  name: string;
  duration: number;  // in seconds
  remaining: number; // in seconds
  isRunning: boolean;
  createdAt: Date;
}

export class TimerServer implements IMcpServerInstance {
  private server: McpServer;
  private timers: Map<string, Timer> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isEnabled = false;
  private readonly MODULE = 'TimerServer';

  constructor() {
    this.server = new McpServer({
      name: "timer-server",
      version: "1.0.0",
    });

    this.setupTools();
    Logger.info('Timer MCP server initialized', { module: this.MODULE });
  }

  private setupTools() {
    // Create timer
    this.server.tool(
      "create-timer",
      "Create a new countdown timer",
      {
        name: z.string().min(1).describe("Name of the timer"),
        duration: z.number().min(1).describe("Duration in seconds"),
      },
      async ({ name, duration }) => {
        if (!this.isEnabled) {
          return {
            isError: true,
            content: [{ type: "text", text: "Timer server is currently disabled" }],
          };
        }

        const id = Date.now().toString();
        const timer: Timer = {
          id,
          name,
          duration,
          remaining: duration,
          isRunning: false,
          createdAt: new Date(),
        };

        this.timers.set(id, timer);
        Logger.info('Timer created', { module: this.MODULE, timerId: id });

        return {
          content: [
            {
              type: "text",
              text: `Timer created successfully with ID: ${id}`,
            },
          ],
        };
      }
    );

    // Start timer
    this.server.tool(
      "start-timer",
      "Start a countdown timer",
      {
        id: z.string().min(1).describe("ID of the timer to start"),
      },
      async ({ id }) => {
        if (!this.isEnabled) {
          return {
            isError: true,
            content: [{ type: "text", text: "Timer server is currently disabled" }],
          };
        }

        const timer = this.timers.get(id);
        if (!timer) {
          return {
            isError: true,
            content: [{ type: "text", text: `Timer with ID ${id} not found` }],
          };
        }

        if (timer.isRunning) {
          return {
            isError: true,
            content: [{ type: "text", text: `Timer ${id} is already running` }],
          };
        }

        timer.isRunning = true;
        const interval = setInterval(() => {
          if (timer.remaining > 0) {
            timer.remaining--;
          } else {
            this.stopTimer(id);
          }
        }, 1000);

        this.intervals.set(id, interval);
        Logger.info('Timer started', { module: this.MODULE, timerId: id });

        return {
          content: [
            {
              type: "text",
              text: `Timer ${id} started`,
            },
          ],
        };
      }
    );

    // Stop timer
    this.server.tool(
      "stop-timer",
      "Stop a countdown timer",
      {
        id: z.string().min(1).describe("ID of the timer to stop"),
      },
      async ({ id }) => {
        if (!this.isEnabled) {
          return {
            isError: true,
            content: [{ type: "text", text: "Timer server is currently disabled" }],
          };
        }

        const result = this.stopTimer(id);
        if (result.error) {
          return {
            isError: true,
            content: [{ type: "text", text: result.error }],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `Timer ${id} stopped`,
            },
          ],
        };
      }
    );

    // List timers
    this.server.tool(
      "list-timers",
      "List all timers",
      {},
      async () => {
        if (!this.isEnabled) {
          return {
            isError: true,
            content: [{ type: "text", text: "Timer server is currently disabled" }],
          };
        }

        const timersList = Array.from(this.timers.values())
          .map(
            (timer) =>
              `ID: ${timer.id}\nName: ${timer.name}\nRemaining: ${timer.remaining}s\nStatus: ${
                timer.isRunning ? "Running" : "Stopped"
              }\n---`
          )
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text: timersList || "No timers found",
            },
          ],
        };
      }
    );
  }

  private stopTimer(id: string): { error?: string } {
    const timer = this.timers.get(id);
    if (!timer) {
      return { error: `Timer with ID ${id} not found` };
    }

    if (!timer.isRunning) {
      return { error: `Timer ${id} is not running` };
    }

    const interval = this.intervals.get(id);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(id);
    }

    timer.isRunning = false;
    Logger.info('Timer stopped', { module: this.MODULE, timerId: id });
    return {};
  }

  public async start(transportConfig: TransportConfig): Promise<void> {
    try {
      let transport;
      if (transportConfig.type === 'sse') {
        if (!transportConfig.getTransport) {
          throw new Error('SSE transport requires getTransport function');
        }
        transport = transportConfig.getTransport('timer');
        if (!transport) {
          throw new Error('Failed to get SSE transport for timer server');
        }
      } else {
        transport = new StdioServerTransport();
      }

      await this.server.connect(transport);
      this.isEnabled = true;
      Logger.info('Timer MCP server started', { module: this.MODULE, transport: transportConfig.type });
    } catch (error) {
      Logger.error('Failed to start Timer MCP server', error as Error, { module: this.MODULE });
      throw error;
    }
  }

  public async stop(): Promise<void> {
    // Stop all running timers
    for (const [id, timer] of this.timers.entries()) {
      if (timer.isRunning) {
        this.stopTimer(id);
      }
    }
    this.isEnabled = false;
    Logger.info('Timer MCP server stopped', { module: this.MODULE });
  }

  public isRunning(): boolean {
    return this.isEnabled;
  }
} 