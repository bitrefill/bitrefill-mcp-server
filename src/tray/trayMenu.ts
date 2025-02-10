import { Tray, Menu, nativeImage, app } from 'electron';
import { PATHS, TRAY_ICONS } from '../config/constants';
import { showMainWindow, setForceQuit } from '../windows/mainWindow';
import { ServerManager } from '../services/ServerManager';
import Logger from '../utils/logger';

const MODULE = 'TrayMenu';
let tray: Tray | null = null;

export const createTrayMenu = (serverManager: ServerManager): void => {
  Logger.debug('Creating tray menu', { 
    module: MODULE, 
    method: 'createTrayMenu',
    exists: !!tray 
  });

  if (tray) {
    Logger.warn('Tray already exists, skipping creation', { 
      module: MODULE, 
      method: 'createTrayMenu' 
    });
    return;
  }

  try {
    // Create the tray with the default icon
    const defaultIconPath = PATHS.getAssetPath('tray-icons', TRAY_ICONS.default);
    Logger.debug('Loading tray icon', { 
      module: MODULE, 
      method: 'createTrayMenu',
      iconPath: defaultIconPath 
    });

    const icon = nativeImage.createFromPath(defaultIconPath);
    tray = new Tray(icon);
    
    const updateMenu = () => {
      Logger.debug('Updating tray menu', { 
        module: MODULE, 
        method: 'updateMenu',
        serverStatus: serverManager.getStatus() 
      });

      const contextMenu = Menu.buildFromTemplate([
        {
          label: serverManager.getStatus() ? 'Stop Server' : 'Start Server',
          click: () => {
            Logger.info('Server toggle clicked', { 
              module: MODULE, 
              method: 'updateMenu' 
            });
            serverManager.toggle();
            updateMenu();
          }
        },
        {
          label: 'Options',
          click: () => {
            Logger.info('Options clicked', { 
              module: MODULE, 
              method: 'updateMenu' 
            });
            showMainWindow();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          click: () => {
            Logger.info('Quit clicked', { 
              module: MODULE, 
              method: 'updateMenu' 
            });
            setForceQuit(true);
            app.quit();
          }
        }
      ]);

      tray?.setContextMenu(contextMenu);
      
      // Update icon based on server state
      const iconName = serverManager.getStatus() ? TRAY_ICONS.active : TRAY_ICONS.inactive;
      const iconPath = PATHS.getAssetPath('tray-icons', iconName);
      Logger.debug('Updating tray icon', { 
        module: MODULE, 
        method: 'updateMenu',
        iconPath,
        serverStatus: serverManager.getStatus() 
      });
      tray?.setImage(nativeImage.createFromPath(iconPath));
    };

    tray.setToolTip('MCP Server');
    updateMenu();
    
    Logger.info('Tray menu created successfully', { 
      module: MODULE, 
      method: 'createTrayMenu' 
    });
  } catch (error) {
    Logger.error('Failed to create tray menu', error as Error, { 
      module: MODULE, 
      method: 'createTrayMenu' 
    });
    throw error;
  }
}; 