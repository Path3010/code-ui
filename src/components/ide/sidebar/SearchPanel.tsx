import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Replace, CaseSensitive, Regex, FileText } from "lucide-react";

export function SearchPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [showReplace, setShowReplace] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-[#3e3e42]">
        <h2 className="text-sm font-medium text-[#cccccc] uppercase tracking-wide mb-3">
          Search
        </h2>
        
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#858585]" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#3c3c3c] border-[#3e3e42] text-white pl-10"
            />
          </div>
          
          {showReplace && (
            <div className="relative">
              <Replace className="absolute left-3 top-3 h-4 w-4 text-[#858585]" />
              <Input
                placeholder="Replace"
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                className="bg-[#3c3c3c] border-[#3e3e42] text-white pl-10"
              />
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${caseSensitive ? 'bg-[#007acc] text-white' : 'text-[#cccccc] hover:bg-[#3e3e42]'}`}
              onClick={() => setCaseSensitive(!caseSensitive)}
            >
              <CaseSensitive className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${useRegex ? 'bg-[#007acc] text-white' : 'text-[#cccccc] hover:bg-[#3e3e42]'}`}
              onClick={() => setUseRegex(!useRegex)}
            >
              <Regex className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[#cccccc] hover:bg-[#3e3e42]"
              onClick={() => setShowReplace(!showReplace)}
            >
              <Replace className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3">
          {searchTerm ? (
            <div className="space-y-2">
              <div className="text-xs text-[#858585] mb-2">
                No results found for "{searchTerm}"
              </div>
            </div>
          ) : (
            <div className="text-center text-[#858585] text-sm py-8">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Enter search term to find in files
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
