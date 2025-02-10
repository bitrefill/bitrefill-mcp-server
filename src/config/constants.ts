import { app, nativeImage } from "electron";
import path from "node:path";
import Logger from "../utils/logger";

export const WINDOW_CONFIG = {
  width: 800,
  height: 600,
  show: false,
} as const;

export const PATHS = {
  getAssetPath: (...paths: string[]): string => {
    const RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, "assets")
      : path.join(process.cwd(), "src/assets");
    return path.join(RESOURCES_PATH, ...paths);
  },
  getPreloadPath: (): string => path.join(__dirname, "../preload.js"),
} as const;

export const TRAY_ICONS = {
  default: "default-16.png",
  active: "active-16.png",
  inactive: "inactive-16.png",
} as const;

const defaultIconPath = PATHS.getAssetPath("tray-icons", TRAY_ICONS.default);
const icon = nativeImage.createFromPath(defaultIconPath);
if (icon.isEmpty()) {
  Logger.error(
    "Tray icon image is empty. Please verify the file exists at the given path.",
    undefined,
    { iconPath: defaultIconPath }
  );
}
