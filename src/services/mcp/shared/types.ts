import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { ServerResponse } from "http";

export interface IMcpServerInstance {
  start(transportConfig: TransportConfig): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
}

export type TransportType = 'stdio' | 'sse';

export interface BaseTransportConfig {
  type: TransportType;
}

export interface StdioTransportConfig extends BaseTransportConfig {
  type: 'stdio';
}

export interface SSETransportConfig extends BaseTransportConfig {
  type: 'sse';
  port: number;
  basePath?: string;
  getTransport?: (serverId: string) => SSEServerTransport | undefined;
}

export type TransportConfig = StdioTransportConfig | SSETransportConfig;

export interface McpServerConfig {
  id: string;
  createInstance: () => IMcpServerInstance;
  options: {
    path?: string;
    [key: string]: unknown;
  };
}

export interface ServerStatus {
  isRunning: boolean;
  transport: TransportType;
  path?: string;
} 