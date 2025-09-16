import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    language: v.optional(v.string()),
    framework: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      userId: user._id,
      isPublic: false,
      language: args.language,
      framework: args.framework,
    });

    // Create initial files
    const rootFolderId = await ctx.db.insert("files", {
      name: args.name,
      path: "/",
      content: "",
      projectId,
      userId: user._id,
      isDirectory: true,
    });

    // Create a welcome file
    await ctx.db.insert("files", {
      name: "README.md",
      path: "/README.md",
      content: `# ${args.name}\n\n${args.description || "Welcome to your new project!"}\n\nStart coding by creating new files or editing existing ones.`,
      language: "markdown",
      projectId,
      userId: user._id,
      parentId: rootFolderId,
    });

    return projectId;
  },
});

export const getUserProjects = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or access denied");
    }

    return project;
  },
});

export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or access denied");
    }

    // Delete all files in the project
    const files = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const file of files) {
      await ctx.db.delete(file._id);
    }

    // Delete recent files
    const recentFiles = await ctx.db
      .query("recentFiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();

    for (const recentFile of recentFiles) {
      await ctx.db.delete(recentFile._id);
    }

    // Delete the project
    await ctx.db.delete(args.projectId);
  },
});
