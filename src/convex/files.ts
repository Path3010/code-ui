import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./users";

export const createFile = mutation({
  args: {
    name: v.string(),
    path: v.string(),
    content: v.optional(v.string()),
    language: v.optional(v.string()),
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    isDirectory: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    // Verify project ownership
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or access denied");
    }

    return await ctx.db.insert("files", {
      name: args.name,
      path: args.path,
      content: args.content || "",
      language: args.language,
      projectId: args.projectId,
      userId: user._id,
      isDirectory: args.isDirectory || false,
      parentId: args.parentId,
    });
  },
});

export const updateFile = mutation({
  args: {
    fileId: v.id("files"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file || file.userId !== user._id) {
      throw new Error("File not found or access denied");
    }

    await ctx.db.patch(args.fileId, {
      content: args.content,
    });

    // Update recent files
    await ctx.runMutation(internal.files.addToRecentFiles, {
      fileId: args.fileId,
      projectId: file.projectId,
    });
  },
});

export const getProjectFiles = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    // Verify project ownership
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      return [];
    }

    return await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getFile = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file || file.userId !== user._id) {
      throw new Error("File not found or access denied");
    }

    return file;
  },
});

export const deleteFileInternal = internalMutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file || file.userId !== user._id) {
      throw new Error("File not found or access denied");
    }

    // If it's a directory, delete all children recursively
    if (file.isDirectory) {
      const children = await ctx.db
        .query("files")
        .withIndex("by_parent", (q) => q.eq("parentId", args.fileId))
        .collect();

      for (const child of children) {
        await ctx.runMutation(internal.files.deleteFileInternal, { fileId: child._id });
      }
    }

    // Remove from recent files
    const recentFiles = await ctx.db
      .query("recentFiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("fileId"), args.fileId))
      .collect();

    for (const recentFile of recentFiles) {
      await ctx.db.delete(recentFile._id);
    }

    await ctx.db.delete(args.fileId);
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.files.deleteFileInternal, { fileId: args.fileId });
  },
});

export const addToRecentFiles = internalMutation({
  args: {
    fileId: v.id("files"),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    // Check if already in recent files
    const existing = await ctx.db
      .query("recentFiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("fileId"), args.fileId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastAccessed: Date.now(),
      });
    } else {
      await ctx.db.insert("recentFiles", {
        userId: user._id,
        fileId: args.fileId,
        projectId: args.projectId,
        lastAccessed: Date.now(),
      });
    }

    // Keep only the 10 most recent files
    const recentFiles = await ctx.db
      .query("recentFiles")
      .withIndex("by_user_and_accessed", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    if (recentFiles.length > 10) {
      for (let i = 10; i < recentFiles.length; i++) {
        await ctx.db.delete(recentFiles[i]._id);
      }
    }
  },
});

export const getRecentFiles = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const recentFiles = await ctx.db
      .query("recentFiles")
      .withIndex("by_user_and_accessed", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(10);

    const filesWithDetails = [];
    for (const recent of recentFiles) {
      const file = await ctx.db.get(recent.fileId);
      const project = await ctx.db.get(recent.projectId);
      if (file && project) {
        filesWithDetails.push({
          ...file,
          project,
          lastAccessed: recent.lastAccessed,
        });
      }
    }

    return filesWithDetails;
  },
});

export const applyTemplate = mutation({
  args: {
    projectId: v.id("projects"),
    templateKey: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    // Verify project ownership
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or access denied");
    }

    // Cache project name to satisfy TypeScript in nested helpers
    const projectName = project.name;

    // Find root folder created at project creation (path "/")
    const all = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const root = all.find((f) => f.isDirectory && f.path === "/");
    if (!root) {
      throw new Error("Root folder not found");
    }

    type Entry = { path: string; isDir: boolean; content?: string; language?: string };
    const byKey: Record<string, Array<Entry>> = {
      blank: [
        { path: "/src", isDir: true },
        { path: "/.gitignore", isDir: false, content: "node_modules\n.dist\n" },
        { path: "/src/main.txt", isDir: false, content: "Start here.", language: "plaintext" },
      ],
      react: [
        { path: "/public", isDir: true },
        { path: "/src", isDir: true },
        { path: "/index.html", isDir: false, content: "<!doctype html><div id=\"root\"></div>" },
        { path: "/src/App.jsx", isDir: false, content: "export default function App(){return <h1>Hello React</h1>}" , language: "javascript"},
        { path: "/src/main.jsx", isDir: false, content: "import App from './App.jsx'\nconsole.log('React starter');", language: "javascript" },
        { path: "/package.json", isDir: false, content: "{\n  \"name\": \"react-starter\",\n  \"private\": true\n}" , language: "json"},
      ],
      node: [
        { path: "/src", isDir: true },
        { path: "/src/index.js", isDir: false, content: "console.log('Hello from Node');", language: "javascript" },
        { path: "/package.json", isDir: false, content: "{\n  \"name\": \"node-starter\"\n}", language: "json" },
      ],
      python: [
        { path: "/src", isDir: true },
        { path: "/src/main.py", isDir: false, content: "print('Hello, Python')", language: "python" },
        { path: "/requirements.txt", isDir: false, content: "", language: "plaintext" },
      ],
    };

    const entries = byKey[args.templateKey] ?? byKey["blank"];

    // Ensure directories first
    const dirs: Array<Entry> = entries.filter((e) => e.isDir);
    const files: Array<Entry> = entries.filter((e) => !e.isDir);

    // Map of directory path -> created id
    const dirMap = new Map<string, any>();
    dirMap.set("/", root._id);

    // Helper to join parent path and name to find parentId from map
    function parentOf(p: string): string {
      if (p === "/") return "/";
      const idx = p.lastIndexOf("/");
      if (idx <= 0) return "/";
      return p.slice(0, idx) || "/";
    }
    function baseName(p: string): string {
      if (p === "/") return projectName;
      const idx = p.lastIndexOf("/");
      return p.slice(idx + 1);
    }

    // Create directories
    for (const d of dirs) {
      const parentPath = parentOf(d.path);
      const parentId = dirMap.get(parentPath);
      const name = baseName(d.path);
      const inserted = await ctx.db.insert("files", {
        name,
        path: d.path,
        content: "",
        language: undefined,
        projectId: args.projectId,
        userId: user._id,
        isDirectory: true,
        parentId,
      });
      dirMap.set(d.path, inserted);
    }

    // Create files
    for (const f of files) {
      const parentPath = parentOf(f.path);
      const parentId = dirMap.get(parentPath);
      const name = baseName(f.path);
      await ctx.db.insert("files", {
        name,
        path: f.path,
        content: f.content ?? "",
        language: f.language,
        projectId: args.projectId,
        userId: user._id,
        isDirectory: false,
        parentId,
      });
    }
  },
});

export const cleanProjectFiles = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    // Verify project ownership
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or access denied");
    }

    // Load all files for the project
    const all = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // If no files, nothing to do
    if (all.length === 0) return;

    // Find root (path "/")
    const root = all.find((f) => f.isDirectory && f.path === "/");

    // If no root exists, we cannot determine reachability from it; do nothing
    if (!root) return;

    // Build adjacency: parentId -> children[]
    const childrenByParent: Map<string, Array<typeof all[number]>> = new Map();
    for (const f of all) {
      const key = f.parentId ? f.parentId : null;
      const k = (key as unknown as string) ?? "__NULL__";
      const arr = childrenByParent.get(k) ?? [];
      arr.push(f);
      childrenByParent.set(k, arr);
    }

    // Traverse from root to find reachable nodes
    const reachable = new Set<string>();
    const stack: Array<string> = [root._id as unknown as string];
    reachable.add(root._id as unknown as string);

    while (stack.length) {
      const cur = stack.pop()!;
      const kids = childrenByParent.get(cur) ?? [];
      for (const child of kids) {
        const idStr = child._id as unknown as string;
        if (!reachable.has(idStr)) {
          reachable.add(idStr);
          if (child.isDirectory) {
            stack.push(idStr);
          }
        }
      }
    }

    // Delete any file in the project that is not reachable from root (excluding root itself)
    for (const f of all) {
      const idStr = f._id as unknown as string;
      if (f._id !== root._id && !reachable.has(idStr)) {
        await ctx.db.delete(f._id);
      }
    }
  },
});

export const resetFilesystem = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Reuse the same reachability logic as cleanProjectFiles to remove all ghost entries.
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or access denied");
    }

    const all = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    if (all.length === 0) return;

    const root = all.find((f) => f.isDirectory && f.path === "/");
    if (!root) return;

    const childrenByParent: Map<string, Array<typeof all[number]>> = new Map();
    for (const f of all) {
      const key = f.parentId ? (f.parentId as unknown as string) : "__NULL__";
      const arr = childrenByParent.get(key) ?? [];
      arr.push(f);
      childrenByParent.set(key, arr);
    }

    const reachable = new Set<string>();
    const stack: Array<string> = [root._id as unknown as string];
    reachable.add(root._id as unknown as string);

    while (stack.length) {
      const cur = stack.pop()!;
      const kids = childrenByParent.get(cur) ?? [];
      for (const child of kids) {
        const idStr = child._id as unknown as string;
        if (!reachable.has(idStr)) {
          reachable.add(idStr);
          if (child.isDirectory) stack.push(idStr);
        }
      }
    }

    for (const f of all) {
      const idStr = f._id as unknown as string;
      if (f._id !== root._id && !reachable.has(idStr)) {
        await ctx.db.delete(f._id);
      }
    }
  },
});