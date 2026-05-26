import { useEffect, useMemo, useState } from "react";
import type { ToolId } from "../shared/types";
import { Sidebar } from "./layout/Sidebar";
import { SrtToTxtPage } from "./tools/srt-to-txt/SrtToTxtPage";
import { ComingSoonPage } from "./tools/coming-soon/ComingSoonPage";

export function App() {
  const [activeTool, setActiveTool] = useState<ToolId>("srt-to-txt");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 900);

    return () => window.clearTimeout(timer);
  }, []);

  const page = useMemo(() => {
    if (activeTool === "pdf-merge") {
      return <ComingSoonPage title="PDF Merge" />;
    }

    return <SrtToTxtPage />;
  }, [activeTool]);

  if (isLoading) {
    return (
      <div className="splash-screen" role="status" aria-live="polite">
        <div className="splash-card">
          <div className="splash-mark">SC</div>
          <div>
            <h1>Subtitle Combine</h1>
            <p>Preparing file tools</p>
          </div>
          <div className="loading-bar" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar activeTool={activeTool} onSelectTool={setActiveTool} />
      <main className="workspace">{page}</main>
    </div>
  );
}
