import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Terminal as TerminalIcon, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface TerminalProps {
  onClose: () => void;
}

export function Terminal({ onClose }: TerminalProps) {
  const { user } = useAuth();
  const userHandle =
    (user?.name && user.name.trim()) ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "user";
  const workingDir = "/workspace";

  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Array<{ type: 'command' | 'output'; content: string }>>([
    { type: 'output', content: '👋 Welcome to Codespaces! You are on our default image.' },
    { type: 'output', content: ' - It includes runtimes and tools for Python, Node.js, Docker, and more.' },
    { type: 'output', content: ' - Want to use a custom image instead? See: https://aka.ms/configure-codespace' },
    { type: 'output', content: '' },
    { type: 'output', content: '🔎 Explore the editor fully via the Command Palette (Ctrl/Cmd + Shift + P).' },
    { type: 'output', content: '' },
    { type: 'output', content: "📝 Edit away! Run your app as usual, and we'll make it available for you to access." },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const projects = useQuery(api.projects.getUserProjects);
  const activeProjectId =
    projects && projects.length > 0 ? projects[0]._id : null;
  const projectFiles = useQuery(
    api.files.getProjectFiles,
    activeProjectId ? { projectId: activeProjectId } : "skip"
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (command: string) => {
    const newHistory = [...history, { type: 'command' as const, content: `$ ${command}` }];
    
    switch (command.toLowerCase().trim()) {
      case 'help':
        newHistory.push({
          type: 'output',
          content: `Available commands:
  help     - Show this help message
  clear    - Clear the terminal
  ls       - List files (simulated)
  pwd      - Show current directory
  echo     - Echo text
  date     - Show current date
  whoami   - Show current user`
        });
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'ls': {
        if (projectFiles && projectFiles.length > 0) {
          // Find the root folder (path "/"), then list its direct children
          const root = projectFiles.find((f: any) => f.isDirectory && f.path === "/");
          if (root) {
            const children = projectFiles
              .filter((f: any) => f.parentId === root._id)
              .map((f: any) => (f.isDirectory ? `${f.name}/` : f.name))
              .sort((a: string, b: string) => a.localeCompare(b));
            newHistory.push({
              type: 'output',
              content: children.length ? children.join('  ') : '(empty)',
            });
          } else {
            // Fallback: list all by path names if root not found
            const names = projectFiles
              .map((f: any) => (f.isDirectory ? `${f.name}/` : f.name))
              .sort((a: string, b: string) => a.localeCompare(b));
            newHistory.push({
              type: 'output',
              content: names.length ? names.join('  ') : '(empty)',
            });
          }
        } else if (activeProjectId === null) {
          newHistory.push({
            type: 'output',
            content: 'No project found. Open Templates to create one.',
          });
        } else {
          newHistory.push({
            type: 'output',
            content: '(loading...)',
          });
        }
        break;
      }
      case 'pwd':
        newHistory.push({
          type: 'output',
          content: workingDir
        });
        break;
      case 'date':
        newHistory.push({
          type: 'output',
          content: new Date().toString()
        });
        break;
      case 'whoami':
        newHistory.push({
          type: 'output',
          content: userHandle
        });
        break;
      default:
        if (command.startsWith('echo ')) {
          newHistory.push({
            type: 'output',
            content: command.substring(5)
          });
        } else if (command.trim()) {
          newHistory.push({
            type: 'output',
            content: `Command not found: ${command}`
          });
        }
    }
    
    setHistory(newHistory);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput("");
    }
  };

  return (
    <div className="h-full bg-[#1e1e1e] flex flex-col border-t border-[#3e3e42]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d30] border-b border-[#3e3e42]">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-[#cccccc]" />
          <span className="text-sm text-[#cccccc]">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-[#cccccc] hover:bg-[#3e3e42]"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-[#cccccc] hover:bg-[#3e3e42]"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto" ref={scrollRef}>
          <div className="p-3 font-mono text-sm">
            {history.map((item, index) => (
              <div
                key={index}
                className={`${
                  item.type === 'command'
                    ? 'text-[#4ec9b0]'
                    : 'text-[#cccccc]'
                } whitespace-pre-wrap`}
              >
                {item.content}
              </div>
            ))}
          </div>
        </div>

        {/* Input Line */}
        <div className="flex items-center px-3 py-2 border-t border-[#3e3e42]">
          {/* Styled prompt: @username -> /workspace $ */}
          <span className="font-mono text-sm mr-2 whitespace-pre">
            <span className="text-[#4ec9b0]">@{userHandle}</span>
            <span className="text-[#56b6c2]"> → </span>
            <span className="text-[#61afef]">{workingDir}</span>
            <span className="text-[#cccccc]"> $</span>
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent text-white font-mono text-sm outline-none"
            placeholder="Type a command..."
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}