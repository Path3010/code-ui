import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X, File, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { eventBus } from "@/lib/eventBus";
// Add: Monaco editor wrapper
import { MonacoEditor } from "./MonacoEditor";

interface EditorTab {
  id: string;
  name: string;
  content: string;
  language: string;
  isDirty: boolean;
}

export function EditorArea() {
  const [tabs, setTabs] = useState<EditorTab[]>([
    {
      id: "welcome",
      name: "Welcome",
      content: `# Welcome to VS Code Clone

## Getting Started

1. Create a new project from the Explorer panel
2. Add files and folders to your project
3. Start coding with syntax highlighting
4. Use the integrated terminal for commands

## Features

- File Explorer with project management
- Tabbed editor interface
- Syntax highlighting
- Integrated terminal
- Search functionality
- Git integration
- Extensions panel

Happy coding! 🚀`,
      language: "markdown",
      isDirty: false,
    },
  ]);
  const [activeTab, setActiveTab] = useState("welcome");

  // Add: listen for external "open-file" events to open/focus tabs
  useEffect(() => {
    function handleOpenFile(e: Event) {
      const detail = (e as CustomEvent).detail as {
        _id: string;
        name: string;
        content: string;
        language?: string | null;
      };
      if (!detail || !detail._id) return;

      setTabs((prev) => {
        const exists = prev.find((t) => t.id === detail._id);
        if (exists) {
          // Focus existing tab
          setActiveTab(detail._id);
          return prev;
        }
        // Create new tab for file
        const newTab = {
          id: detail._id,
          name: detail.name,
          content: detail.content ?? "",
          language: detail.language ?? "plaintext",
          isDirty: false,
        };
        // Focus the new tab
        setActiveTab(detail._id);
        return [...prev, newTab];
      });
    }

    eventBus.addEventListener("open-file", handleOpenFile as EventListener);
    return () => {
      eventBus.removeEventListener("open-file", handleOpenFile as EventListener);
    };
  }, []);

  const closeTab = (tabId: string) => {
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    }
  };

  const updateTabContent = (tabId: string, content: string) => {
    setTabs(tabs.map(tab => 
      tab.id === tabId 
        ? { ...tab, content, isDirty: true }
        : tab
    ));
  };

  return (
    <div className="h-full bg-[#1e1e1e] flex flex-col">
      {tabs.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Tab Bar */}
          <div className="bg-[#2d2d30] border-b border-[#3e3e42]">
            <TabsList className="h-auto p-0 bg-transparent w-full justify-start rounded-none">
              <AnimatePresence>
                {tabs.map((tab) => (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="relative group"
                  >
                    <TabsTrigger
                      value={tab.id}
                      className={`
                        h-9 px-3 rounded-none border-r border-[#3e3e42] 
                        data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white
                        hover:bg-[#37373d] text-[#cccccc] flex items-center gap-2
                      `}
                    >
                      <File className="h-3 w-3" />
                      <span className="text-sm">{tab.name}</span>
                      {tab.isDirty && <Circle className="h-2 w-2 fill-current" />}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 hover:bg-[#3e3e42]"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </TabsTrigger>
                  </motion.div>
                ))}
              </AnimatePresence>
            </TabsList>
          </div>

          {/* Editor Content */}
          <div className="flex-1">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="h-full m-0 p-0"
              >
                <div className="h-full">
                  <MonacoEditor
                    value={tab.content}
                    language={tab.language || "plaintext"}
                    onChange={(val: string | undefined) => updateTabContent(tab.id, val ?? "")}
                  />
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-[#858585]">
            <File className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No files open</h3>
            <p className="text-sm">Open a file from the Explorer to start editing</p>
          </div>
        </div>
      )}
    </div>
  );
}