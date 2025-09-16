import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { GitBranch, GitCommit, GitPullRequest, Plus } from "lucide-react";

export function GitPanel() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-[#3e3e42]">
        <h2 className="text-sm font-medium text-[#cccccc] uppercase tracking-wide mb-3">
          Source Control
        </h2>
        
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start bg-[#3c3c3c] border-[#3e3e42] text-white hover:bg-[#4e4e4e]"
          >
            <GitBranch className="h-4 w-4 mr-2" />
            main
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-medium text-[#cccccc] uppercase tracking-wide mb-2">
                Changes
              </h3>
              <div className="text-center text-[#858585] text-sm py-4">
                No changes
              </div>
            </div>
            
            <div>
              <h3 className="text-xs font-medium text-[#cccccc] uppercase tracking-wide mb-2">
                Staged Changes
              </h3>
              <div className="text-center text-[#858585] text-sm py-4">
                No staged changes
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
