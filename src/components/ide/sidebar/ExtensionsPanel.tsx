import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, Star, Download } from "lucide-react";

export function ExtensionsPanel() {
  const extensions = [
    {
      name: "Prettier",
      description: "Code formatter",
      downloads: "15M",
      rating: 4.8,
      installed: true,
    },
    {
      name: "ESLint",
      description: "JavaScript linter",
      downloads: "12M",
      rating: 4.7,
      installed: false,
    },
    {
      name: "GitLens",
      description: "Git supercharged",
      downloads: "8M",
      rating: 4.9,
      installed: false,
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-[#3e3e42]">
        <h2 className="text-sm font-medium text-[#cccccc] uppercase tracking-wide mb-3">
          Extensions
        </h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#858585]" />
          <Input
            placeholder="Search extensions"
            className="bg-[#3c3c3c] border-[#3e3e42] text-white pl-10"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {extensions.map((ext) => (
            <div
              key={ext.name}
              className="p-3 bg-[#2d2d30] rounded border border-[#3e3e42] hover:bg-[#37373d] transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#007acc]" />
                  <h3 className="text-sm font-medium text-white">{ext.name}</h3>
                </div>
                <Button
                  variant={ext.installed ? "secondary" : "default"}
                  size="sm"
                  className="h-6 text-xs"
                >
                  {ext.installed ? "Installed" : "Install"}
                </Button>
              </div>
              
              <p className="text-xs text-[#cccccc] mb-2">{ext.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-[#858585]">
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {ext.downloads}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {ext.rating}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
