import { Explorer } from "./sidebar/Explorer";
import { SearchPanel } from "./sidebar/SearchPanel";
import { GitPanel } from "./sidebar/GitPanel";
import { ExtensionsPanel } from "./sidebar/ExtensionsPanel";

interface SidebarProps {
  activeView: "explorer" | "search" | "git" | "extensions";
}

export function Sidebar({ activeView }: SidebarProps) {
  const renderContent = () => {
    switch (activeView) {
      case "explorer":
        return <Explorer />;
      case "search":
        return <SearchPanel />;
      case "git":
        return <GitPanel />;
      case "extensions":
        return <ExtensionsPanel />;
      default:
        return <Explorer />;
    }
  };

  return (
    <div className="h-full bg-[#252526] border-r border-[#3e3e42] flex flex-col">
      {renderContent()}
    </div>
  );
}
