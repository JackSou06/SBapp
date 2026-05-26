export type ToolId = "srt-to-txt" | "pdf-merge";

export interface FileEntry {
  id: string;
  name: string;
  path?: string;
  size: number;
  content: string;
}

export interface SaveTxtPayload {
  defaultName: string;
  content: string;
}
