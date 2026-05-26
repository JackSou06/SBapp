import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import { spawn } from "node:child_process";
import path from "node:path";
import { existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import type { FileEntry, SaveTxtPayload } from "../shared/types";

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 880,
    minHeight: 620,
    title: "SBapp",
    backgroundColor: "#f6f7f9",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    mainWindow.loadURL("http://127.0.0.1:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createApplicationMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function registerIpcHandlers() {
  ipcMain.handle("updates:check", async (): Promise<{ checked: boolean; message: string }> => {
    return checkForUpdates();
  });

  ipcMain.handle("files:select-srt", async (): Promise<FileEntry[]> => {
    const result = await dialog.showOpenDialog({
      title: "Select SRT files",
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "SRT files", extensions: ["srt"] }]
    });

    if (result.canceled) {
      return [];
    }

    return Promise.all(
      result.filePaths.map(async (filePath) => ({
        id: makeFileId(filePath),
        name: path.basename(filePath),
        path: filePath,
        size: (await fs.stat(filePath)).size,
        content: await fs.readFile(filePath, "utf8")
      }))
    );
  });

  ipcMain.handle(
    "files:save-txt",
    async (_event, payload: SaveTxtPayload): Promise<{ saved: boolean; path?: string }> => {
      const result = await dialog.showSaveDialog({
        title: "Export TXT",
        defaultPath: payload.defaultName,
        filters: [{ name: "Text file", extensions: ["txt"] }]
      });

      if (result.canceled || !result.filePath) {
        return { saved: false };
      }

      await fs.writeFile(result.filePath, payload.content, "utf8");
      return { saved: true, path: result.filePath };
    }
  );
}

function makeFileId(filePath: string): string {
  return `${filePath}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function checkForUpdates(): { checked: boolean; message: string } {
  if (process.platform !== "darwin") {
    return {
      checked: false,
      message: "Update checks are only available in the macOS app."
    };
  }

  if (isDev) {
    return {
      checked: false,
      message: "Update checks run in the packaged macOS app."
    };
  }

  const helperPath = path.join(process.resourcesPath, "SparkleUpdateHelper");

  if (!existsSync(helperPath)) {
    return {
      checked: false,
      message: "Sparkle update helper is not bundled yet. Build it with scripts/build_sparkle_helper.sh before packaging a release."
    };
  }

  const child = spawn(helperPath, [app.getPath("exe")], {
    detached: true,
    stdio: "ignore"
  });

  child.unref();

  return {
    checked: true,
    message: "Opening Sparkle update checker..."
  };
}

function createApplicationMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        {
          label: "Check for Updates...",
          click: () => {
            const result = checkForUpdates();
            if (!result.checked) {
              dialog.showMessageBox({
                type: "info",
                title: "Check for Updates",
                message: result.message
              });
            }
          }
        },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" }
      ]
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "zoom" }, { role: "front" }]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
