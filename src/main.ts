import { app } from 'electron';
import { createMainWindow } from './windows/mainWindow';
import { createTrayMenu } from './tray/trayMenu';
import { setupAppEvents } from './events/appEvents';
import { ServerManager } from './services/ServerManager';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Initialize server manager
const serverManager = new ServerManager();

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  await createMainWindow();
  createTrayMenu(serverManager);
  setupAppEvents();
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  createMainWindow();
});

// Ensure proper cleanup
app.on('before-quit', () => {
  serverManager.cleanup();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
