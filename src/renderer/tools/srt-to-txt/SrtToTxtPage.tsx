import { DragEvent, useMemo, useState } from "react";
import type { FileEntry } from "../../../shared/types";
import { combineSrtFilesToText } from "../../../shared/srt";

type Status = "idle" | "ready" | "error" | "saved";

export function SrtToTxtPage() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("Add at least two SRT files to combine.");
  const [isDragging, setIsDragging] = useState(false);
  const [dragDepth, setDragDepth] = useState(0);
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
  const [dragOverFileId, setDragOverFileId] = useState<string | null>(null);

  const combinedText = useMemo(() => combineSrtFilesToText(files), [files]);

  async function selectFiles() {
    const selected = await window.fileTools.selectSrtFiles();
    addFiles(selected);
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    setDragDepth(0);

    const droppedFiles = Array.from(event.dataTransfer.files);
    const srtFiles = droppedFiles.filter((file) => file.name.toLowerCase().endsWith(".srt"));

    if (srtFiles.length === 0) {
      setStatus("error");
      setMessage("Only .srt files can be added.");
      return;
    }

    const entries = await Promise.all(
      srtFiles.map(async (file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        size: file.size,
        content: await file.text()
      }))
    );

    addFiles(entries);
  }

  function addFiles(nextFiles: FileEntry[]) {
    if (nextFiles.length === 0) {
      return;
    }

    setFiles((current) => [...current, ...nextFiles]);
    setStatus("ready");
    setMessage(`${nextFiles.length} file${nextFiles.length > 1 ? "s" : ""} added.`);
  }

  function moveFile(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= files.length) {
      return;
    }

    const nextFiles = [...files];
    const [file] = nextFiles.splice(index, 1);
    nextFiles.splice(targetIndex, 0, file);
    setFiles(nextFiles);
  }

  function moveFileTo(sourceId: string, targetId: string) {
    if (sourceId === targetId) {
      return;
    }

    setFiles((current) => {
      const sourceIndex = current.findIndex((file) => file.id === sourceId);
      const targetIndex = current.findIndex((file) => file.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1) {
        return current;
      }

      const nextFiles = [...current];
      const [movedFile] = nextFiles.splice(sourceIndex, 1);
      nextFiles.splice(targetIndex, 0, movedFile);
      return nextFiles;
    });
  }

  function removeFile(id: string) {
    const nextFiles = files.filter((file) => file.id !== id);
    setFiles(nextFiles);
    setStatus(nextFiles.length > 0 ? "ready" : "idle");
    setMessage(nextFiles.length > 0 ? "File removed." : "Add at least two SRT files to combine.");
  }

  async function exportTxt() {
    if (files.length < 2) {
      setStatus("error");
      setMessage("Please add at least two SRT files before exporting.");
      return;
    }

    if (!combinedText.trim()) {
      setStatus("error");
      setMessage("No SRT text was found in the selected files.");
      return;
    }

    const result = await window.fileTools.saveTxtFile({
      defaultName: "combined-subtitle-combine.txt",
      content: combinedText
    });

    if (result.saved) {
      setStatus("saved");
      setMessage(`Saved to ${result.path}`);
    }
  }

  return (
    <section className="tool-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Tool</p>
          <h2>SRT to TXT</h2>
        </div>
        <button className="primary-button" type="button" onClick={exportTxt} disabled={files.length < 2}>
          Export TXT
        </button>
      </header>

      <div
        className={isDragging ? "drop-zone dragging" : "drop-zone"}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragDepth((depth) => depth + 1);
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragDepth((depth) => {
            const nextDepth = Math.max(0, depth - 1);
            setIsDragging(nextDepth > 0);
            return nextDepth;
          });
        }}
        onDrop={handleDrop}
      >
        <div className="drop-art" aria-hidden="true">
          TXT
        </div>
        <div>
          <h3>Drop SRT files here</h3>
          <p>Files are combined from top to bottom and exported as plain text.</p>
        </div>
        <button className="secondary-button" type="button" onClick={selectFiles}>
          Select Files
        </button>
      </div>

      <div className="status-row" data-status={status}>
        {message}
      </div>

      <section className="file-panel" aria-label="Selected files">
        <div className="panel-heading">
          <h3>Order</h3>
          <span>{files.length} files</span>
        </div>

        {files.length === 0 ? (
          <div className="file-empty">No files selected.</div>
        ) : (
          <ol className="file-list">
            {files.map((file, index) => (
              <li
                className={[
                  "file-item",
                  draggedFileId === file.id ? "dragging" : "",
                  dragOverFileId === file.id && draggedFileId !== file.id ? "drag-over" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={file.id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", file.id);
                  setDraggedFileId(file.id);
                }}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setDragOverFileId(file.id);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDragLeave={() => {
                  if (dragOverFileId === file.id) {
                    setDragOverFileId(null);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const sourceId = event.dataTransfer.getData("text/plain") || draggedFileId;
                  if (sourceId) {
                    moveFileTo(sourceId, file.id);
                    setMessage("File order updated.");
                    setStatus("ready");
                  }
                  setDraggedFileId(null);
                  setDragOverFileId(null);
                }}
                onDragEnd={() => {
                  setDraggedFileId(null);
                  setDragOverFileId(null);
                }}
              >
                <div className="file-index" title="Drag to reorder">
                  {index + 1}
                </div>
                <div className="file-meta">
                  <strong>{file.name}</strong>
                  <span>{formatFileSize(file.size)}</span>
                </div>
                <div className="file-actions" aria-label={`Actions for ${file.name}`}>
                  <button type="button" title="Move up" onClick={() => moveFile(index, -1)} disabled={index === 0}>
                    ↑
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    onClick={() => moveFile(index, 1)}
                    disabled={index === files.length - 1}
                  >
                    ↓
                  </button>
                  <button type="button" title="Remove" onClick={() => removeFile(file.id)}>
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="preview-panel" aria-label="Text preview">
        <div className="panel-heading">
          <h3>Preview</h3>
          <span>{combinedText.length} characters</span>
        </div>
        <pre>{combinedText || "Combined text preview will appear here."}</pre>
      </section>
    </section>
  );
}

function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
