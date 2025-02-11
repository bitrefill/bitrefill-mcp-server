/// <reference types="vite/client" />

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

interface ServerStatus {
  isRunning: boolean;
  mcp: {
    notes: boolean;
    timer: boolean;
  };
}

interface Window {
  api: {
    getServerStatus: () => Promise<ServerStatus>;
    toggleServer: () => Promise<void>;
    toggleMcpServer: (server: 'notes' | 'timer') => Promise<void>;
    onServerStatusChange: (callback: (status: ServerStatus) => void) => () => void;
  }
}

export {}; 