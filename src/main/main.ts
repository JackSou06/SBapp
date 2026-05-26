import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "node:path";
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
