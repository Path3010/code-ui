import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Terminal as TerminalIcon, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

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

  // xterm refs
  const termRef = useRef<XTerm | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentInputRef = useRef<string>("");

  const projects = useQuery(api.projects.getUserProjects);

  let activeProjectId: any = null;
  try {
    const stored = localStorage.getItem("activeProjectId");
    if (stored) activeProjectId = stored as any;
  } catch {
    // ignore
  }
  if (!activeProjectId && projects && projects.length > 0) {
    activeProjectId = projects[0]._id;
  }

  const projectFiles = useQuery(
    api.files.getProjectFiles,
    activeProjectId ? { projectId: activeProjectId } : "skip"
  );

  const cleanProject = useMutation(api.files.cleanProjectFiles);

  // Add: safe fit helper that only fits when container has dimensions
  function safeFit() {
    const container = containerRef.current;
    const fit = fitRef.current;
    if (!container || !fit) return;
    const { clientWidth, clientHeight } = container;
    if (!clientWidth || !clientHeight) return;
    try {
      fit.fit();
    } catch {
      // ignore fitting errors during rapid layout changes
    }
  }

  // Initialize xterm
  useEffect(() => {
    if (containerRef.current && !termRef.current) {
      const term = new XTerm({
        convertEol: true,
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: 13,
        theme: {
          background: "#1e1e1e",
          foreground: "#cccccc",
          cursor: "#cccccc",
          selectionBackground: "#3e3e42",
          black: "#000000",
          red: "#f44747",
          green: "#4ec9b0",
          yellow: "#e5c07b",
          blue: "#61afef",
          magenta: "#c586c0",
          cyan: "#56b6c2",
          white: "#d4d4d4",
          brightBlack: "#666666",
          brightRed: "#f44747",
          brightGreen: "#4ec9b0",
          brightYellow: "#e5c07b",
          brightBlue: "#61afef",
          brightMagenta: "#c586c0",
          brightCyan: "#56b6c2",
          brightWhite: "#ffffff",
        },
      });
      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(containerRef.current);
      fitRef.current = fit;
      termRef.current = term;

      // Replace direct fit with safe fit
      safeFit();
      // Fit again on next tick to account for late layout
      setTimeout(safeFit, 0);

      printWelcome();

      term.onData((data: string) => handleTermInput(data));
      window.addEventListener("resize", handleResize);
    }
    return () => {
      window.removeEventListener("resize", handleResize);
      termRef.current?.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // re-fit on layout changes safely
    safeFit();
  });

  function handleResize() {
    // Use safe fit on window resize
    safeFit();
  }

  function prompt() {
    const term = termRef.current;
    if (!term) return;
    term.write(
      `\x1b[38;2;78;201;176m@${userHandle}\x1b[0m \x1b[38;2;86;182;194m→\x1b[0m \x1b[38;2;97;175;239m${workingDir}\x1b[0m \x1b[38;2;204;204;204m$\x1b[0m `
    );
  }

  function println(text = "") {
    termRef.current?.writeln(text);
  }

  function printWelcome() {
    println("👋 Welcome to Codespaces! You are on our default image.");
    println(" - It includes runtimes and tools for Python, Node.js, Docker, and more.");
    println(" - Want to use a custom image instead? See: https://aka.ms/configure-codespace");
    println("");
    println("🔎 Explore the editor fully via the Command Palette (Ctrl/Cmd + Shift + P).");
    println("");
    println("📝 Edit away! Run your app as usual, and we'll make it available for you to access.");
    prompt();
  }

  function handleTermInput(data: string) {
    const term = termRef.current;
    if (!term) return;

    for (const ch of data) {
      const code = ch.charCodeAt(0);
      // Enter
      if (code === 13) {
        term.write("\r\n");
        const cmd = currentInputRef.current;
        currentInputRef.current = "";
        runCommand(cmd);
        return;
      }
      // Backspace (DEL or BS)
      if (code === 127 || code === 8) {
        if (currentInputRef.current.length > 0) {
          currentInputRef.current = currentInputRef.current.slice(0, -1);
          term.write("\b \b");
        }
        continue;
      }
      // Printable
      if (code >= 32 && code <= 126) {
        currentInputRef.current += ch;
        term.write(ch);
      }
    }
  }

  function runCommand(raw: string) {
    const command = raw.toLowerCase().trim();
    switch (command) {
      case "help":
        println(`Available commands:
  help       - Show this help message
  clear      - Clear the terminal
  ls         - List files (current project)
  pwd        - Show current directory
  echo       - Echo text (use: echo <text>)
  date       - Show current date
  whoami     - Show current user
  clean      - Remove stale project files (not reachable from root "/")
`);
        prompt();
        break;
      case "clear":
        termRef.current?.clear();
        prompt();
        break;
      case "pwd":
        println(workingDir);
        prompt();
        break;
      case "date":
        println(new Date().toString());
        prompt();
        break;
      case "whoami":
        println(userHandle);
        prompt();
        break;
      case "ls": {
        if (projectFiles && projectFiles.length > 0) {
          const root = projectFiles.find((f: any) => f.isDirectory && f.path === "/");
          if (root) {
            const children = projectFiles
              .filter((f: any) => f.parentId === root._id)
              .map((f: any) => (f.isDirectory ? `${f.name}/` : f.name))
              .sort((a: string, b: string) => a.localeCompare(b));
            println(children.length ? children.join("  ") : "(empty)");
          } else {
            const names = projectFiles
              .map((f: any) => (f.isDirectory ? `${f.name}/` : f.name))
              .sort((a: string, b: string) => a.localeCompare(b));
            println(names.length ? names.join("  ") : "(empty)");
          }
        } else if (activeProjectId === null) {
          println("No project found. Open Templates to create one.");
        } else {
          println("(loading...)");
        }
        prompt();
        break;
      }
      case "clean": {
        println("Cleaning project files...");
        if (activeProjectId) {
          cleanProject({ projectId: activeProjectId as any })
            .then(() => {
              println("Cleanup complete.");
              prompt();
            })
            .catch((e: any) => {
              println(`Cleanup failed: ${e?.message || "unknown error"}`);
              prompt();
            });
        } else {
          println("No active project to clean.");
          prompt();
        }
        break;
      }
      default: {
        if (raw.startsWith("echo ")) {
          println(raw.substring(5));
        } else if (raw.trim()) {
          println(`Command not found: ${raw}`);
        }
        prompt();
      }
    }
  }

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
            onClick={() => {
              // Optional: support multiple terminals later
              // For now just focus prompt
              prompt();
            }}
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
      <div className="flex-1 min-h-0">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Input line removed; xterm handles input */}
    </div>
  );
}