import { app, BrowserWindow } from 'electron';
import { createMainWindow, setForceQuit } from '../windows/mainWindow';
import Logger from '../utils/logger';

const MODULE = 'AppEvents';

export const setupAppEvents = (): void => {
  Logger.info('Setting up application events', { module: MODULE });

  // Handle before-quit event
  app.on('before-quit', () => {
    Logger.info('Application before-quit event triggered', { 
      module: MODULE, 
      method: 'before-quit' 
    });
    setForceQuit(true);
  });

  // Handle window-all-closed event
  app.on('window-all-closed', () => {
    Logger.debug('All windows closed event triggered', { 
      module: MODULE, 
      method: 'window-all-closed',
      platform: process.platform 
    });

    if (process.platform !== 'darwin') {
      Logger.info('Quitting application (non-macOS)', { 
        module: MODULE, 
        method: 'window-all-closed' 
      });
      setForceQuit(true);
      app.quit();
    }
  });

  // Handle activate event (macOS)
  app.on('activate', () => {
    const windowCount = BrowserWindow.getAllWindows().length;
    Logger.debug('App activate event triggered', { 
      module: MODULE, 
      method: 'activate',
      windowCount 
    });

    if (windowCount === 0) {
      Logger.info('Creating new window on activate', { 
        module: MODULE, 
        method: 'activate' 
      });
      createMainWindow();
    }
  });

  Logger.info('Application events setup completed', { module: MODULE });
}; 