import { app, BrowserWindow, ipcMain } from 'electron';
import { createMainWindow } from './windows/mainWindow';
import { createTrayMenu, updateTrayMenu } from './tray/trayMenu';
import { ServerManager } from './services/ServerManager';
import Logger from './utils/logger';

const MODULE = 'Main';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Initialize server manager
const serverManager = new ServerManager();

// IPC handlers for server management
ipcMain.handle('server:getStatus', () => {
  Logger.debug('IPC: Getting server status', { module: MODULE });
  return serverManager.getStatus();
});

ipcMain.handle('server:toggle', () => {
  Logger.debug('IPC: Toggling server', { module: MODULE });
  serverManager.toggle();
  updateTrayMenu();
});

ipcMain.handle('server:toggleMcp', (_event, server: 'notes' | 'timer') => {
  Logger.debug('IPC: Toggling MCP server', { module: MODULE, server });
  serverManager.toggleMcpServer(server);
  updateTrayMenu();
});

// Function to broadcast server status to all windows
const broadcastServerStatus = () => {
  const status = serverManager.getStatus();
  Logger.debug('Broadcasting server status', { module: MODULE, status });
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('server:statusUpdate', status);
  });
  updateTrayMenu();
};

// Set up status update interval
setInterval(broadcastServerStatus, 1000);

// This method will be called when Electron has finished initialization
app.on('ready', async () => {
  Logger.info('Application ready', { module: MODULE });
  
  try {
    await createMainWindow();
    createTrayMenu(serverManager);
    Logger.info('Application initialized successfully', { module: MODULE });
  } catch (error) {
    Logger.error('Failed to initialize application', error as Error, { module: MODULE });
    app.quit();
  }
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  Logger.info('All windows closed', { module: MODULE });
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  Logger.info('Application activated', { module: MODULE });
  if (BrowserWindow.getAllWindows().length === 0) {
    await createMainWindow();
  }
});

// Ensure proper cleanup
app.on('before-quit', () => {
  Logger.info('Application quitting', { module: MODULE });
  serverManager.cleanup();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
