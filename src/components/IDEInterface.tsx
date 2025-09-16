import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./ide/Sidebar";
import { EditorArea } from "./ide/EditorArea";
import { Terminal } from "./ide/Terminal";
import { StatusBar } from "./ide/StatusBar";
import { ActivityBar } from "./ide/ActivityBar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export function IDEInterface() {
  const [activeView, setActiveView] = useState<"explorer" | "search" | "git" | "extensions">("explorer");
  const [terminalVisible, setTerminalVisible] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleViewChange = (view: "explorer" | "search" | "git" | "extensions") => {
    if (activeView === view) {
      setSidebarCollapsed((c) => !c);
    } else {
      setActiveView(view);
      setSidebarCollapsed(false);
    }
  };

  return (
    <div className="h-screen flex bg-[#1e1e1e] text-white overflow-hidden">
      {/* Activity Bar */}
      <ActivityBar activeView={activeView} onViewChange={handleViewChange} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Sidebar (conditionally render to avoid layout glitches) */}
          {!sidebarCollapsed && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
                <Sidebar activeView={activeView} />
              </ResizablePanel>
              <ResizableHandle className="w-1 bg-[#2d2d30] hover:bg-[#3e3e42] transition-colors" />
            </>
          )}
          
          {/* Editor and Terminal */}
          <ResizablePanel defaultSize={sidebarCollapsed ? 100 : 80}>
            <ResizablePanelGroup direction="vertical">
              {/* Editor Area */}
              <ResizablePanel defaultSize={terminalVisible ? 70 : 100}>
                <EditorArea />
              </ResizablePanel>
              
              {terminalVisible && (
                <>
                  <ResizableHandle className="h-1 bg-[#2d2d30] hover:bg-[#3e3e42] transition-colors" />
                  <ResizablePanel defaultSize={30} minSize={20}>
                    <Terminal onClose={() => setTerminalVisible(false)} />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
        
        {/* Status Bar */}
        <StatusBar onToggleTerminal={() => setTerminalVisible(!terminalVisible)} />
      </div>
    </div>
  );
}