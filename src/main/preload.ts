import { contextBridge, ipcRenderer } from "electron";
import type { SaveTxtPayload } from "../shared/types";

contextBridge.exposeInMainWorld("fileTools", {
  selectSrtFiles: () => ipcRenderer.invoke("files:select-srt"),
  saveTxtFile: (payload: SaveTxtPayload) => ipcRenderer.invoke("files:save-txt", payload)
});
