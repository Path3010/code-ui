import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  Trash2,
  Edit3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";

export function Explorer() {
  const [selectedProject, setSelectedProject] = useState<Id<"projects"> | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<Id<"files">>>(new Set());
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newFileOpen, setNewFileOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);

  const projects = useQuery(api.projects.getUserProjects);
  const projectFiles = useQuery(
    api.files.getProjectFiles,
    selectedProject ? { projectId: selectedProject } : "skip"
  );

  const createProject = useMutation(api.projects.createProject);
  const createFile = useMutation(api.files.createFile);
  const deleteProject = useMutation(api.projects.deleteProject);
  const deleteFile = useMutation(api.files.deleteFile);

  const handleCreateProject = async (formData: FormData) => {
    try {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const language = formData.get("language") as string;
      const framework = formData.get("framework") as string;

      const projectId = await createProject({
        name,
        description: description || undefined,
        language: language || undefined,
        framework: framework || undefined,
      });

      setSelectedProject(projectId);
      setNewProjectOpen(false);
      toast.success("Project created successfully!");
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  const handleCreateFile = async (formData: FormData) => {
    if (!selectedProject) return;

    try {
      const name = formData.get("name") as string;
      const language = formData.get("language") as string;

      await createFile({
        name,
        path: `/${name}`,
        content: "",
        language: language || undefined,
        projectId: selectedProject,
        isDirectory: false,
      });

      setNewFileOpen(false);
      toast.success("File created successfully!");
    } catch (error) {
      toast.error("Failed to create file");
    }
  };

  const handleCreateFolder = async (formData: FormData) => {
    if (!selectedProject) return;

    try {
      const name = formData.get("name") as string;

      await createFile({
        name,
        path: `/${name}`,
        content: "",
        projectId: selectedProject,
        isDirectory: true,
      });

      setNewFolderOpen(false);
      toast.success("Folder created successfully!");
    } catch (error) {
      toast.error("Failed to create folder");
    }
  };

  const toggleFolder = (folderId: Id<"files">) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) {
      return expandedFolders.has(fileName as any) ? FolderOpen : Folder;
    }
    return File;
  };

  const renderFileTree = (files: any[], parentId?: Id<"files">) => {
    const filteredFiles = files.filter(file => file.parentId === parentId);
    
    return filteredFiles.map((file) => {
      const Icon = getFileIcon(file.name, file.isDirectory);
      const hasChildren = files.some(f => f.parentId === file._id);
      const isExpanded = expandedFolders.has(file._id);

      return (
        <motion.div
          key={file._id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="select-none"
        >
          <div
            className="flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer group"
            onClick={() => file.isDirectory ? toggleFolder(file._id) : null}
          >
            <Icon className="h-4 w-4 text-[#cccccc]" />
            <span className="text-sm text-[#cccccc] flex-1">{file.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 text-[#cccccc] hover:bg-[#3e3e42]"
              onClick={(e) => {
                e.stopPropagation();
                deleteFile({ fileId: file._id });
                toast.success("File deleted");
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-[#cccccc] uppercase tracking-wide">
            Explorer
          </h2>
          <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-[#cccccc] hover:bg-[#3e3e42]"
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#2d2d30] border-[#3e3e42] text-white">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <form action={handleCreateProject} className="space-y-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="my-awesome-project"
                    className="bg-[#3c3c3c] border-[#3e3e42] text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Project description..."
                    className="bg-[#3c3c3c] border-[#3e3e42] text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select name="language">
                      <SelectTrigger className="bg-[#3c3c3c] border-[#3e3e42] text-white">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2d2d30] border-[#3e3e42]">
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="csharp">C#</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="framework">Framework</Label>
                    <Select name="framework">
                      <SelectTrigger className="bg-[#3c3c3c] border-[#3e3e42] text-white">
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2d2d30] border-[#3e3e42]">
                        <SelectItem value="react">React</SelectItem>
                        <SelectItem value="vue">Vue</SelectItem>
                        <SelectItem value="angular">Angular</SelectItem>
                        <SelectItem value="svelte">Svelte</SelectItem>
                        <SelectItem value="nextjs">Next.js</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="fastapi">FastAPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Create Project
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Project Selector */}
        {projects && projects.length > 0 && (
          <Select
            value={selectedProject || ""}
            onValueChange={(value) => setSelectedProject(value as Id<"projects">)}
          >
            <SelectTrigger className="bg-[#3c3c3c] border-[#3e3e42] text-white text-sm">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent className="bg-[#2d2d30] border-[#3e3e42]">
              {projects.map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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
              {renderFileTree(projectFiles)}
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
