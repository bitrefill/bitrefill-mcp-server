import { BrowserWindow } from 'electron';
import { WINDOW_CONFIG, PATHS } from '../config/constants';
import Logger from '../utils/logger';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

const MODULE = 'MainWindow';
let mainWindow: BrowserWindow | null = null;
let isForceQuitting = false;

export const setForceQuit = (force: boolean): void => {
  Logger.debug('Setting force quit flag', { 
    module: MODULE, 
    method: 'setForceQuit',
    force 
  });
  isForceQuitting = force;
};

export const createMainWindow = async (): Promise<void> => {
  Logger.debug('Creating main window', { 
    module: MODULE, 
    method: 'createMainWindow',
    exists: !!mainWindow 
  });

  if (mainWindow) {
    if (!mainWindow.isVisible()) {
      Logger.info('Showing existing window', { module: MODULE, method: 'createMainWindow' });
      mainWindow.show();
    }
    return;
  }

  try {
    Logger.info('Initializing new window', { module: MODULE, method: 'createMainWindow' });
    mainWindow = new BrowserWindow({
      ...WINDOW_CONFIG,
      webPreferences: {
        preload: PATHS.getPreloadPath(),
        contextIsolation: true,
        nodeIntegration: false
      },
    });

    // Load the app
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      Logger.debug('Loading dev server URL', { 
        module: MODULE, 
        method: 'createMainWindow',
        url: MAIN_WINDOW_VITE_DEV_SERVER_URL 
      });
      await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
      mainWindow.webContents.openDevTools();
      mainWindow.show();
    } else {
      const filePath = `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`;
      Logger.debug('Loading production file', { 
        module: MODULE, 
        method: 'createMainWindow',
        filePath 
      });
      await mainWindow.loadFile(filePath);
    }

    // Handle window close event
    mainWindow.on('close', (event) => {
      Logger.debug('Window close event triggered', { 
        module: MODULE, 
        method: 'onClose',
        isForceQuitting 
      });

      if (!isForceQuitting) {
        event.preventDefault();
        mainWindow?.hide();
        Logger.info('Window hidden instead of closed', { module: MODULE, method: 'onClose' });
      } else {
        Logger.info('Force quitting application', { module: MODULE, method: 'onClose' });
      }
    });

    Logger.info('Main window created successfully', { module: MODULE, method: 'createMainWindow' });
  } catch (error) {
    Logger.error('Failed to create main window', error as Error, { 
      module: MODULE, 
      method: 'createMainWindow' 
    });
    throw error;
  }
};

export const getMainWindow = (): BrowserWindow | null => {
  Logger.debug('Getting main window reference', { 
    module: MODULE, 
    method: 'getMainWindow',
    exists: !!mainWindow 
  });
  return mainWindow;
};

export const showMainWindow = (): void => {
  Logger.debug('Showing main window', { 
    module: MODULE, 
    method: 'showMainWindow',
    exists: !!mainWindow 
  });

  if (!mainWindow) {
    Logger.warn('Attempted to show non-existent window', { 
      module: MODULE, 
      method: 'showMainWindow' 
    });
    return;
  }

  mainWindow.show();
  Logger.info('Main window shown', { module: MODULE, method: 'showMainWindow' });
}; 