import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getUserThreads = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("thread"),
      userId: v.id("users"),
      _creationTime: v.number(),
      streamingStatus: v.string(),
      title: v.string(),
      updatedAt: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const threads = await ctx.db
      .query("thread")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return threads;
  },
});

export const getSingleThreadWithStreamingStatus = query({
  args: {
    threadId: v.id("thread"),
  },
  returns: v.object({
    _id: v.id("thread"),
    streamingStatus: v.union(
      v.literal("idle"),
      v.literal("streaming"),
      v.literal("error"),
    ),
  }),
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    return {
      _id: thread._id,
      streamingStatus: thread.streamingStatus,
    };
  },
});

export const getSingleThread = query({
  args: {
    threadId: v.id("thread"),
  },
  returns: v.object({
    _id: v.id("thread"),
    _creationTime: v.number(),
    title: v.string(),
    updatedAt: v.string(),
    userId: v.id("users"),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const thread = await ctx.db
      .query("thread")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("_id"), args.threadId))
      .unique();
    if (!thread || thread.userId !== userId) {
      throw new Error("Thread not found");
    }
    return thread;
  },
});
