export interface ServerStatus {
  isRunning: boolean;
  mcp: {
    notes: boolean;
    timer: boolean;
  };
}

export interface PreloadApi {
  getServerStatus: () => Promise<ServerStatus>;
  toggleServer: () => Promise<void>;
  toggleMcpServer: (server: 'notes' | 'timer') => Promise<void>;
  onServerStatusChange: (callback: (status: ServerStatus) => void) => () => void;
}

declare global {
  interface Window {
    api: PreloadApi;
  }
} 