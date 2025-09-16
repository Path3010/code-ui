import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Files, Search, GitBranch, Package, Settings, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ActivityBarProps {
  activeView: "explorer" | "search" | "git" | "extensions";
  onViewChange: (view: "explorer" | "search" | "git" | "extensions") => void;
}

export function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  const { signOut } = useAuth();

  const activities = [
    { id: "explorer" as const, icon: Files, label: "Explorer" },
    { id: "search" as const, icon: Search, label: "Search" },
    { id: "git" as const, icon: GitBranch, label: "Source Control" },
    { id: "extensions" as const, icon: Package, label: "Extensions" },
  ];

  return (
    <div className="w-12 bg-[#2c2c2c] flex flex-col items-center py-2 border-r border-[#3e3e42]">
      <TooltipProvider>
        {/* Main Activities */}
        <div className="flex flex-col gap-1">
          {activities.map((activity) => (
            <Tooltip key={activity.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-10 h-10 ${
                    activeView === activity.id
                      ? "bg-[#37373d] text-white border-l-2 border-[#007acc]"
                      : "text-[#cccccc] hover:bg-[#37373d] hover:text-white"
                  }`}
                  onClick={() => onViewChange(activity.id)}
                >
                  <activity.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{activity.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex-1" />
        <div className="flex flex-col gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 text-[#cccccc] hover:bg-[#37373d] hover:text-white"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 text-[#cccccc] hover:bg-[#37373d] hover:text-white"
                onClick={() => signOut()}
              >
                <User className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Sign Out</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
