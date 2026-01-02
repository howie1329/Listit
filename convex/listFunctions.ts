import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getLists = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("list"),
      userId: v.id("users"),
      title: v.string(),
      description: v.string(),
      _creationTime: v.number(),
      updatedAt: v.string(), // UTC string
      isCompleted: v.boolean(),
      isDeleted: v.boolean(),
      isArchived: v.boolean(),
      isPinned: v.boolean(),
      isPublic: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const lists = await ctx.db
      .query("list")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return lists;
  },
});

export const createList = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    return await ctx.db.insert("list", {
      userId: userId,
      title: args.title,
      description: args.description ?? "",
      updatedAt: new Date().toISOString(),
      isCompleted: false,
      isDeleted: false,
      isArchived: false,
      isPinned: false,
      isPublic: false,
    });
  },
});

export const updateList = mutation({
  args: {
    listId: v.id("list"),
    title: v.string(),
    description: v.string(),
    isCompleted: v.boolean(),
    isDeleted: v.boolean(),
    isArchived: v.boolean(),
    isPinned: v.boolean(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const list = await ctx.db
      .query("list")
      .filter((q) => q.eq(q.field("_id"), args.listId))
      .unique();
    if (!list || list.userId !== userId) {
      throw new Error("You are not authorized to update this list");
    }
    return await ctx.db.patch(args.listId, {
      title: args.title,
      description: args.description,
      updatedAt: new Date().toISOString(),
      isCompleted: args.isCompleted,
      isDeleted: args.isDeleted,
      isArchived: args.isArchived,
      isPinned: args.isPinned,
      isPublic: args.isPublic,
    });
  },
});

export const softDeleteList = mutation({
  args: {
    listId: v.id("list"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const list = await ctx.db.get(args.listId);
    if (!list || list.userId !== userId) {
      throw new Error("You are not authorized to delete this list");
    }
    return await ctx.db.patch(args.listId, {
      isDeleted: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const hardDeleteList = mutation({
  args: {
    listId: v.id("list"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const list = await ctx.db.get(args.listId);
    if (!list || list.userId !== userId) {
      throw new Error("You are not authorized to delete this list");
    }
    if (!list) {
      throw new Error("List not found");
    }
    await ctx.db.delete(args.listId);
  },
});

export const archiveList = mutation({
  args: {
    listId: v.id("list"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const list = await ctx.db.get(args.listId);
    if (!list || list.userId !== userId) {
      throw new Error("You are not authorized to archive this list");
    }
    if (!list) {
      throw new Error("List not found");
    }
    return await ctx.db.patch(args.listId, {
      isArchived: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const unarchiveList = mutation({
  args: {
    listId: v.id("list"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const list = await ctx.db.get(args.listId);
    if (!list || list.userId !== userId) {
      throw new Error("You are not authorized to unarchive this list");
    }
    return await ctx.db.patch(args.listId, {
      isArchived: false,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const pinList = mutation({
  args: {
    listId: v.id("list"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const list = await ctx.db.get(args.listId);
    if (!list || list.userId !== userId) {
      throw new Error("You are not authorized to pin this list");
    }
    await ctx.db.patch(args.listId, {
      isPinned: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const unpinList = mutation({
  args: {
    listId: v.id("list"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const list = await ctx.db.get(args.listId);
    if (!list || list.userId !== userId) {
      throw new Error("You are not authorized to unpin this list");
    }
    return await ctx.db.patch(args.listId, {
      isPinned: false,
      updatedAt: new Date().toISOString(),
    });
  },
});
