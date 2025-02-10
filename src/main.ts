import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isServerRunning = false;

const getAssetPath = (...paths: string[]): string => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../src/assets');
  
  return path.join(RESOURCES_PATH, ...paths);
};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false, // Window is created hidden
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Handle window close event
  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow?.hide();
  });
};

const createTray = () => {
  // Create the tray with the default icon
  const defaultIconPath = getAssetPath('tray-icons', 'default-16.png');
  const icon = nativeImage.createFromPath(defaultIconPath);
  tray = new Tray(icon);
  
  const updateMenu = () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: isServerRunning ? 'Stop Server' : 'Start Server',
        click: () => {
          isServerRunning = !isServerRunning;
          // Here you would add the actual server start/stop logic
          updateMenu();
        }
      },
      {
        label: 'Options',
        click: () => {
          mainWindow?.show();
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]);

    tray?.setContextMenu(contextMenu);
    // Update icon based on server state
    const iconName = isServerRunning ? 'active-16.png' : 'inactive-16.png';
    const iconPath = getAssetPath('tray-icons', iconName);
    tray?.setImage(nativeImage.createFromPath(iconPath));
  };

  tray.setToolTip('MCP Server');
  updateMenu();
};

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  createTray();
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Ensure proper cleanup
app.on('before-quit', () => {
  mainWindow?.removeAllListeners('close');
  mainWindow?.close();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
