import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createMastraThread = mutation({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    return await ctx.db.insert("mastra_threads", {
      resourceId: userId,
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      metadata: {},
      updatedAt: new Date().toISOString(),
    });
  },
});

export const createThread = mutation({
  args: {
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    return await ctx.db.insert("thread", {
      userId: userId,
      title: args.title || "New Thread",
      streamingStatus: "idle",
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateThreadStreamingStatus = mutation({
  args: {
    threadId: v.id("thread"),
    streamingStatus: v.union(
      v.literal("idle"),
      v.literal("streaming"),
      v.literal("error"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.threadId, {
      streamingStatus: args.streamingStatus,
    });
  },
});

export const deleteThread = mutation({
  args: {
    threadId: v.id("thread"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== userId) {
      throw new Error("Thread not found");
    }

    // Delete all messages in the thread first
    const messages = await ctx.db
      .query("uiMessages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the thread
    await ctx.db.delete(args.threadId);

    return { success: true };
  },
});

export const updateThreadTitle = mutation({
  args: {
    threadId: v.id("thread"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== userId) {
      throw new Error("Thread not found");
    }

    await ctx.db.patch(args.threadId, {
      title: args.title,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});
