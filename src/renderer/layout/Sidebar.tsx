import type { ToolId } from "../../shared/types";

interface SidebarProps {
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
}

const tools: Array<{ id: ToolId; label: string; description: string; icon: string }> = [
  {
    id: "srt-to-txt",
    label: "SRT to TXT",
    description: "Combine SRT text",
    icon: "S"
  },
  {
    id: "pdf-merge",
    label: "PDF Merge",
    description: "Coming soon",
    icon: "P"
  }
];

export function Sidebar({ activeTool, onSelectTool }: SidebarProps) {
  const checkForUpdates = async () => {
    const result = await window.updates.checkForUpdates();

    if (!result.checked) {
      window.alert(result.message);
    }
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">SB</div>
        <div>
          <h1>SBapp</h1>
          <p>File tools</p>
        </div>
      </div>

      <nav className="tool-nav" aria-label="Main tools">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={activeTool === tool.id ? "tool-link active" : "tool-link"}
            type="button"
            onClick={() => onSelectTool(tool.id)}
          >
            <span className="tool-icon" aria-hidden="true">
              {tool.icon}
            </span>
            <span>
              <span className="tool-label">{tool.label}</span>
              <span className="tool-description">{tool.description}</span>
            </span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="update-button" type="button" onClick={checkForUpdates}>
          檢查更新
        </button>
      </div>
    </aside>
  );
}
