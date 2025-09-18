import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { 
  FolderPlus, 
  FilePlus, 
  MoreHorizontal, 
  Folder, 
  FolderOpen, 
  File,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";
import { openFileInEditor } from "@/lib/eventBus";

export function Explorer() {
  // Initialize from localStorage if available
  const [selectedProject, setSelectedProject] = useState<Id<"projects"> | null>(() => {
    try {
      const stored = localStorage.getItem("activeProjectId");
      return stored ? (stored as unknown as Id<"projects">) : null;
    } catch {
      return null;
    }
  });
  const [expandedFolders, setExpandedFolders] = useState<Set<Id<"files">>>(new Set());
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newFileOpen, setNewFileOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  // Track the most recently opened folder to target for creation
  const [currentOpenFolderForCreation, setCurrentOpenFolderForCreation] = useState<Id<"files"> | null>(null);

  const projects = useQuery(api.projects.getUserProjects);
  const projectFiles = useQuery(
    api.files.getProjectFiles,
    selectedProject ? { projectId: selectedProject } : "skip"
  );

  const createProject = useMutation(api.projects.createProject);
  const createFile = useMutation(api.files.createFile);
  const deleteFile = useMutation(api.files.deleteFile);

  // Keep localStorage in sync when selectedProject changes
  useEffect(() => {
    if (!selectedProject) return;
    try {
      localStorage.setItem("activeProjectId", selectedProject as unknown as string);
    } catch {
      // ignore storage errors
    }
  }, [selectedProject]);

  // Auto-select first project OR use stored one if present
  useEffect(() => {
    if (!projects || projects.length === 0) return;
    // If we already have a selected project, ensure it exists in list; if not, fall back
    if (selectedProject && projects.some(p => p._id === selectedProject)) return;

    // Try localStorage first
    try {
      const stored = localStorage.getItem("activeProjectId");
      const match = stored ? projects.find(p => p._id === (stored as unknown as Id<"projects">)) : null;
      if (match) {
        setSelectedProject(match._id);
        return;
      }
    } catch {
      // ignore
    }

    // Fallback: pick the first project
    setSelectedProject(projects[0]._id);
  }, [projects, selectedProject]);

  // Auto-create a default workspace if user has no projects
  const [bootstrapped, setBootstrapped] = useState(false);
  useEffect(() => {
    if (!bootstrapped && projects && projects.length === 0) {
      (async () => {
        try {
          const projectId = await createProject({
            name: "Workspace",
            description: "Default workspace",
            language: undefined,
            framework: undefined,
          });
          setSelectedProject(projectId);
          try {
            localStorage.setItem("activeProjectId", projectId as unknown as string);
          } catch {
            // ignore
          }
        } catch (e) {
          // noop
        } finally {
          setBootstrapped(true);
        }
      })();
    }
  }, [projects, bootstrapped, createProject]);

  // Auto-select first project if available
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]._id);
    }
  }, [projects, selectedProject]);

  // Auto-detect project root folder (path "/")
  const rootFolder = projectFiles?.find((f: any) => f.isDirectory && f.path === "/");

  // Determine which parent to render from: root if it actually has children, else top-level (undefined)
  const startParentId: Id<"files"> | undefined =
    rootFolder && projectFiles?.some((f: any) => f.parentId === rootFolder._id)
      ? rootFolder._id
      : undefined;

  // When files load, auto-expand the root folder and target it for creation
  useEffect(() => {
    if (!rootFolder) return;
    setExpandedFolders((prev) => {
      if (prev.has(rootFolder._id)) return prev;
      const next = new Set(prev);
      next.add(rootFolder._id);
      return next;
    });
    setCurrentOpenFolderForCreation((prev) => prev ?? rootFolder._id);
  }, [rootFolder]);

  const toggleFolder = (folderId: Id<"files">) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
      // If we close the current target folder, clear it
      if (currentOpenFolderForCreation === folderId) {
        setCurrentOpenFolderForCreation(null);
      }
    } else {
      newExpanded.add(folderId);
      // The most recently opened folder becomes the target for creation
      setCurrentOpenFolderForCreation(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Add: path join helper
  const joinPaths = (base: string, name: string) => {
    if (!base || base === "/") return `/${name}`;
    return base.endsWith("/") ? `${base}${name}` : `${base}/${name}`;
  };

  // Add: create file handler (targets the most recently opened folder if any)
  const handleCreateFile = async (formData: FormData) => {
    const name = String(formData.get("name") || "").trim();
    const language = (formData.get("language") as string | null) || undefined;

    if (!name) {
      toast.error("Please enter a file name");
      return;
    }
    if (!selectedProject) {
      toast.error("No project selected");
      return;
    }

    const parentId = currentOpenFolderForCreation ?? undefined;

    let parentPath = "/";
    if (parentId && projectFiles) {
      const parent = projectFiles.find((f: any) => f._id === parentId);
      if (parent && typeof parent.path === "string") parentPath = parent.path;
    }

    const path = joinPaths(parentPath, name);

    try {
      await createFile({
        name,
        path,
        content: "",
        language: language || undefined,
        projectId: selectedProject,
        parentId,
        isDirectory: false,
      });
      toast.success("File created");
      setNewFileOpen(false);
    } catch (err) {
      toast.error("Failed to create file");
    }
  };

  // Add: create folder handler (targets the most recently opened folder if any)
  const handleCreateFolder = async (formData: FormData) => {
    const name = String(formData.get("name") || "").trim();

    if (!name) {
      toast.error("Please enter a folder name");
      return;
    }
    if (!selectedProject) {
      toast.error("No project selected");
      return;
    }

    const parentId = currentOpenFolderForCreation ?? undefined;

    let parentPath = "/";
    if (parentId && projectFiles) {
      const parent = projectFiles.find((f: any) => f._id === parentId);
      if (parent && typeof parent.path === "string") parentPath = parent.path;
    }

    const path = joinPaths(parentPath, name);

    try {
      const newId = await createFile({
        name,
        path,
        content: "",
        projectId: selectedProject,
        parentId,
        isDirectory: true,
      });

      // Expand and target the newly created folder
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        next.add(newId);
        return next;
      });
      setCurrentOpenFolderForCreation(newId);

      toast.success("Folder created");
      setNewFolderOpen(false);
    } catch (err) {
      toast.error("Failed to create folder");
    }
  };

  const getFileIcon = (isDirectory: boolean, isOpen: boolean) => {
    if (isDirectory) {
      return isOpen ? FolderOpen : Folder;
    }
    return File;
  };

  const renderFileTree = (files: any[], parentId?: Id<"files">) => {
    const filteredFiles = files.filter(file => file.parentId === parentId);
    
    return filteredFiles.map((file) => {
      const isExpanded = expandedFolders.has(file._id);
      const Icon = getFileIcon(file.isDirectory, isExpanded);
      const hasChildren = files.some(f => f.parentId === file._id);

      return (
        <motion.div
          key={file._id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="select-none"
        >
          <div
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#2a2d2e] cursor-pointer group transition-colors"
            onClick={() => file.isDirectory ? toggleFolder(file._id) : openFileInEditor({
              _id: file._id,
              name: file.name,
              content: file.content ?? "",
              language: file.language ?? undefined,
            })}
          >
            <Icon className={`h-4 w-4 transition-colors ${file.isDirectory ? "text-[#e5c07b]" : "text-[#61afef]"}`} />
            <span className={`text-sm flex-1 truncate ${file.isDirectory ? "text-[#e6e6e6] font-medium" : "text-[#cccccc]"}`}>
              {file.name}
            </span>
            {/* Prevent deleting the root (path "/") and confirm deletes */}
            {file.path !== "/" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-[#cccccc] hover:bg-[#3e3e42] transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  const isDir = !!file.isDirectory;
                  const ok = window.confirm(
                    `Delete ${isDir ? "folder and all its contents" : "file"} "${file.name}"?`
                  );
                  if (!ok) return;
                  deleteFile({ fileId: file._id })
                    .then(() => toast.success("Deleted"))
                    .catch((err) => toast.error(err?.message || "Failed to delete"));
                }}
                aria-label={`Delete ${file.name}`}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <AnimatePresence>
            {file.isDirectory && isExpanded && hasChildren && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="ml-4 border-l border-[#3e3e42] pl-2"
              >
                {renderFileTree(files, file._id)}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-[#3e3e42]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#cccccc] uppercase tracking-wide">
            Explorer
          </h2>
        </div>

        {/* Project Selector */}
      </div>

      {/* File Actions */}
      {selectedProject && (
        <div className="flex items-center gap-1 p-2 border-b border-[#3e3e42]">
          <Dialog open={newFileOpen} onOpenChange={setNewFileOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[#cccccc] hover:bg-[#3e3e42]"
              >
                <FilePlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#2d2d30] border-[#3e3e42] text-white">
              <DialogHeader>
                <DialogTitle>Create New File</DialogTitle>
              </DialogHeader>
              <form action={handleCreateFile} className="space-y-4">
                <div>
                  <Label htmlFor="fileName">File Name</Label>
                  <Input
                    id="fileName"
                    name="name"
                    placeholder="index.js"
                    className="bg-[#3c3c3c] border-[#3e3e42] text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fileLanguage">Language</Label>
                  <Select name="language">
                    <SelectTrigger className="bg-[#3c3c3c] border-[#3e3e42] text-white">
                      <SelectValue placeholder="Auto-detect" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2d2d30] border-[#3e3e42]">
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Create File
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[#cccccc] hover:bg-[#3e3e42]"
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#2d2d30] border-[#3e3e42] text-white">
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <form action={handleCreateFolder} className="space-y-4">
                <div>
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    name="name"
                    placeholder="components"
                    className="bg-[#3c3c3c] border-[#3e3e42] text-white"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Folder
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {projectFiles && projectFiles.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-1"
            >
              {/* Render children of the root if it has any; otherwise render top-level items */}
              {renderFileTree(projectFiles, startParentId)}
            </motion.div>
          ) : selectedProject ? (
            <div className="text-center text-[#858585] text-sm py-8">
              No files in this project
            </div>
          ) : (
            <div className="text-center text-[#858585] text-sm py-8">
              Select or create a project to get started
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}