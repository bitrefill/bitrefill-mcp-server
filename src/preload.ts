// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Server management
    getServerStatus: () => ipcRenderer.invoke('server:getStatus'),
    toggleServer: () => ipcRenderer.invoke('server:toggle'),
    toggleMcpServer: (server: 'notes' | 'timer') => ipcRenderer.invoke('server:toggleMcp', server),
    
    // Subscribe to server status updates
    onServerStatusChange: (callback: (status: any) => void) => {
      ipcRenderer.on('server:statusUpdate', (_event, status) => callback(status));
      return () => {
        ipcRenderer.removeAllListeners('server:statusUpdate');
      };
    }
  }
);
