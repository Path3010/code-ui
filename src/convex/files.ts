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