import { Button } from "@/components/ui/button";
import { GitBranch, AlertCircle, CheckCircle, Terminal } from "lucide-react";

interface StatusBarProps {
  onToggleTerminal: () => void;
}

export function StatusBar({ onToggleTerminal }: StatusBarProps) {
  return (
    <div className="h-6 bg-[#007acc] flex items-center justify-between px-3 text-white text-xs">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <GitBranch className="h-3 w-3" />
          <span>main</span>
        </div>
        
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          <span>No issues</span>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-2 text-white hover:bg-white/20"
          onClick={onToggleTerminal}
        >
          <Terminal className="h-3 w-3 mr-1" />
          Terminal
        </Button>
        
        <div>Ln 1, Col 1</div>
        <div>UTF-8</div>
        <div>JavaScript</div>
      </div>
    </div>
  );
}
