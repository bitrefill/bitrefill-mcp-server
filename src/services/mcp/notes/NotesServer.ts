import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import Logger from "../../../utils/logger";
import { TransportConfig } from "../shared/types";
import { IMcpServerInstance } from "../shared/types";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class NotesServer implements IMcpServerInstance {
  private mcpServer: McpServer | null = null;
  private notes: Map<string, Note> = new Map();
  private isEnabled = false;
  private readonly MODULE = 'NotesServer';

  public async start(transportConfig: TransportConfig): Promise<void> {
    if (this.isEnabled) {
      Logger.warn('Notes server already running', { module: this.MODULE });
      return;
    }

    this.mcpServer = new McpServer({
      name: "notes-server",
      version: "1.0.0",
    });

    let transport;
    if (transportConfig.type === 'sse') {
      if (!transportConfig.getTransport) {
        throw new Error('SSE transport requires getTransport function');
      }
      transport = transportConfig.getTransport('notes');
      if (!transport) {
        throw new Error('Failed to get SSE transport for notes server');
      }
    } else {
      transport = new StdioServerTransport();
    }

    await this.mcpServer.connect(transport);

    // Setup tools
    this.setupTools();

    this.isEnabled = true;
    Logger.info('Notes server started', { module: this.MODULE });
  }

  private setupTools() {
    // Create note
    this.mcpServer?.tool(
      "create-note",
      "Create a new note",
      {
        title: z.string().min(1).describe("Title of the note"),
        content: z.string().min(1).describe("Content of the note"),
      },
      async ({ title, content }) => {
        if (!this.isEnabled) {
          return {
            isError: true,
            content: [{ type: "text", text: "Notes server is currently disabled" }],
          };
        }

        const id = Date.now().toString();
        const note: Note = {
          id,
          title,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.notes.set(id, note);
        Logger.info('Note created', { module: this.MODULE, noteId: id });

        return {
          content: [
            {
              type: "text",
              text: `Note created successfully with ID: ${id}`,
            },
          ],
        };
      }
    );

    // List notes
    this.mcpServer?.tool(
      "list-notes",
      "List all notes",
      {},
      async () => {
        if (!this.isEnabled) {
          return {
            isError: true,
            content: [{ type: "text", text: "Notes server is currently disabled" }],
          };
        }

        const notesList = Array.from(this.notes.values())
          .map(
            (note) =>
              `ID: ${note.id}\nTitle: ${note.title}\nCreated: ${note.createdAt.toLocaleString()}\n---`
          )
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text: notesList || "No notes found",
            },
          ],
        };
      }
    );

    // Delete note
    this.mcpServer?.tool(
      "delete-note",
      "Delete a note by ID",
      {
        id: z.string().min(1).describe("ID of the note to delete"),
      },
      async ({ id }) => {
        if (!this.isEnabled) {
          return {
            isError: true,
            content: [{ type: "text", text: "Notes server is currently disabled" }],
          };
        }

        if (!this.notes.has(id)) {
          return {
            isError: true,
            content: [{ type: "text", text: `Note with ID ${id} not found` }],
          };
        }

        this.notes.delete(id);
        Logger.info('Note deleted', { module: this.MODULE, noteId: id });

        return {
          content: [
            {
              type: "text",
              text: `Note ${id} deleted successfully`,
            },
          ],
        };
      }
    );
  }

  public async stop(): Promise<void> {
    this.isEnabled = false;
    Logger.info('Notes MCP server stopped', { module: this.MODULE });
  }

  public isRunning(): boolean {
    return this.isEnabled;
  }
} 