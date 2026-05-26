import type { FileEntry, SaveTxtPayload } from "./shared/types";

declare global {
  interface Window {
    fileTools: {
      selectSrtFiles: () => Promise<FileEntry[]>;
      saveTxtFile: (payload: SaveTxtPayload) => Promise<{ saved: boolean; path?: string }>;
    };
    updates: {
      checkForUpdates: () => Promise<{ checked: boolean; message: string }>;
    };
  }
}

export {};
