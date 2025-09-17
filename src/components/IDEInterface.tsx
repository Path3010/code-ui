import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./ide/Sidebar";
import { EditorArea } from "./ide/EditorArea";
import { Terminal } from "./ide/Terminal";
import { StatusBar } from "./ide/StatusBar";
import { ActivityBar } from "./ide/ActivityBar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from "@/components/ui/menubar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Terminal as TerminalIcon, PanelsTopLeft } from "lucide-react";

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

  const handleToggleSidebar = () => setSidebarCollapsed((c) => !c);
  const handleToggleTerminal = () => setTerminalVisible((v) => !v);

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-white overflow-hidden">
      {/* VS Code style Title + Menu bar */}
      <div className="border-b border-[#3e3e42] bg-[#2d2d30]">
        <div className="flex items-center gap-2 px-2 py-1">
          {/* Nav buttons */}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-[#cccccc] hover:bg-[#3e3e42]" onClick={() => window.history.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-[#cccccc] hover:bg-[#3e3e42]" onClick={() => window.history.forward()}>
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Menubar */}
          <Menubar className="bg-transparent border-0 text-sm">
            <MenubarMenu>
              <MenubarTrigger className="text-[#cccccc] hover:bg-[#3e3e42]">File</MenubarTrigger>
              <MenubarContent className="bg-[#2d2d30] border-[#3e3e42] text-[#e6e6e6]">
                <MenubarItem className="focus:bg-[#3e3e42]">New File... <MenubarShortcut>Ctrl+N</MenubarShortcut></MenubarItem>
                <MenubarItem className="focus:bg-[#3e3e42]">Open File... <MenubarShortcut>Ctrl+O</MenubarShortcut></MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="text-[#cccccc] hover:bg-[#3e3e42]">Edit</MenubarTrigger>
              <MenubarContent className="bg-[#2d2d30] border-[#3e3e42] text-[#e6e6e6]">
                <MenubarItem className="focus:bg-[#3e3e42]">Undo <MenubarShortcut>Ctrl+Z</MenubarShortcut></MenubarItem>
                <MenubarItem className="focus:bg-[#3e3e42]">Redo <MenubarShortcut>Ctrl+Y</MenubarShortcut></MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="text-[#cccccc] hover:bg-[#3e3e42]">Selection</MenubarTrigger>
              <MenubarContent className="bg-[#2d2d30] border-[#3e3e42] text-[#e6e6e6]">
                <MenubarItem className="focus:bg-[#3e3e42]">Select All <MenubarShortcut>Ctrl+A</MenubarShortcut></MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="text-[#cccccc] hover:bg-[#3e3e42]">View</MenubarTrigger>
              <MenubarContent className="bg-[#2d2d30] border-[#3e3e42] text-[#e6e6e6]">
                <MenubarItem onClick={handleToggleSidebar} className="focus:bg-[#3e3e42]">
                  Toggle Sidebar <MenubarShortcut>Ctrl+B</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={handleToggleTerminal} className="focus:bg-[#3e3e42]">
                  Toggle Terminal <MenubarShortcut>Ctrl+`</MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="text-[#cccccc] hover:bg-[#3e3e42]">Go</MenubarTrigger>
              <MenubarContent className="bg-[#2d2d30] border-[#3e3e42] text-[#e6e6e6]">
                <MenubarItem className="focus:bg-[#3e3e42]">Back</MenubarItem>
                <MenubarItem className="focus:bg-[#3e3e42]">Forward</MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="text-[#cccccc] hover:bg-[#3e3e42]">Run</MenubarTrigger>
              <MenubarContent className="bg-[#2d2d30] border-[#3e3e42] text-[#e6e6e6]">
                <MenubarItem className="focus:bg-[#3e3e42]">Start Debugging <MenubarShortcut>F5</MenubarShortcut></MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="text-[#cccccc] hover:bg-[#3e3e42]">Terminal</MenubarTrigger>
              <MenubarContent className="bg-[#2d2d30] border-[#3e3e42] text-[#e6e6e6]">
                <MenubarItem onClick={handleToggleTerminal} className="focus:bg-[#3e3e42]">
                  Toggle Terminal <MenubarShortcut>Ctrl+`</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator className="bg-[#3e3e42]" />
                <MenubarItem className="focus:bg-[#3e3e42]">New Terminal</MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="text-[#cccccc] hover:bg-[#3e3e42]">Help</MenubarTrigger>
              <MenubarContent className="bg-[#2d2d30] border-[#3e3e42] text-[#e6e6e6]">
                <MenubarItem className="focus:bg-[#3e3e42]">About</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          {/* Title/search area */}
          <div className="flex-1 flex items-center justify-center px-2">
            <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#3e3e42] rounded px-2 py-1 w-full max-w-[520px]">
              <Search className="h-4 w-4 text-[#858585]" />
              <Input
                placeholder="Search..."
                className="h-7 bg-transparent border-0 text-[#e6e6e6] focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          {/* Quick toggles */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${sidebarCollapsed ? "text-[#cccccc]" : "text-white"} hover:bg-[#3e3e42]`}
              onClick={handleToggleSidebar}
              title="Toggle Sidebar"
            >
              <PanelsTopLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${terminalVisible ? "text-white" : "text-[#cccccc]"} hover:bg-[#3e3e42]`}
              onClick={handleToggleTerminal}
              title="Toggle Terminal"
            >
              <TerminalIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main layout below title/menu bar */}
      <div className="flex-1 flex">
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
          <StatusBar onToggleTerminal={handleToggleTerminal} />
        </div>
      </div>
    </div>
  );
}