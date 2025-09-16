import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Terminal as TerminalIcon, Plus } from "lucide-react";

interface TerminalProps {
  onClose: () => void;
}

export function Terminal({ onClose }: TerminalProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Array<{ type: 'command' | 'output'; content: string }>>([
    { type: 'output', content: 'Welcome to VS Code Clone Terminal' },
    { type: 'output', content: 'Type "help" for available commands' },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      case 'ls':
        newHistory.push({
          type: 'output',
          content: 'README.md  src/  package.json  node_modules/'
        });
        break;
      case 'pwd':
        newHistory.push({
          type: 'output',
          content: '/workspace/my-project'
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
          content: 'developer'
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
        <ScrollArea className="flex-1" ref={scrollRef}>
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
        </ScrollArea>

        {/* Input Line */}
        <div className="flex items-center px-3 py-2 border-t border-[#3e3e42]">
          <span className="text-[#4ec9b0] font-mono text-sm mr-2">$</span>
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
