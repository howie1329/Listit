import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getMastraThreads = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("mastra_threads"),
      createdAt: v.string(),
      id: v.string(),
      metadata: v.optional(v.any()),
      resourceId: v.string(),
      title: v.string(),
      updatedAt: v.string(),
      _creationTime: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const threads = await ctx.db
      .query("mastra_threads")
      //.withIndex("by_resource", (q) => q.eq("resourceId", userId))
      .collect();
    console.log("Mastra threads", threads);
    return threads.map((thread) => ({
      _id: thread._id,
      createdAt: thread.createdAt,
      id: thread.id,
      metadata: thread.metadata,
      resourceId: thread.resourceId,
      title: thread.title,
      updatedAt: thread.updatedAt,
      _creationTime: thread._creationTime,
    }));
  },
});

export const getSingleMastraThread = query({
  args: {
    threadId: v.string(),
  },
  returns: v.object({
    _id: v.id("mastra_threads"),
    title: v.string(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const thread = await ctx.db
      .query("mastra_threads")
      //.withIndex("by_resource", (q) => q.eq("resourceId", userId))
      .filter((q) => q.eq(q.field("id"), args.threadId))
      .unique();

    if (!thread) {
      throw new Error("Thread not found");
    }

    return {
      _id: thread._id,
      title: thread.title,
    };
  },
});

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
      summaryCount: v.optional(v.number()),
      lastSummaryAt: v.optional(v.string()),
      lastSummaryId: v.optional(v.id("threadSummaries")),
      messagesSinceLastSummary: v.optional(v.number()),
      tokensSinceLastSummary: v.optional(v.number()),
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

export const getUserThreadsWithPreview = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("thread"),
      userId: v.id("users"),
      _creationTime: v.number(),
      streamingStatus: v.string(),
      title: v.string(),
      updatedAt: v.string(),
      lastMessagePreview: v.optional(v.string()),
      summaryCount: v.optional(v.number()),
      lastSummaryAt: v.optional(v.string()),
      lastSummaryId: v.optional(v.id("threadSummaries")),
      messagesSinceLastSummary: v.optional(v.number()),
      tokensSinceLastSummary: v.optional(v.number()),
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

    // For each thread, get the last assistant message for preview
    const threadsWithPreview = await Promise.all(
      threads.map(async (thread) => {
        const messages = await ctx.db
          .query("uiMessages")
          .withIndex("by_threadId", (q) => q.eq("threadId", thread._id))
          .order("desc")
          .collect();

        // Find the last assistant message with text content
        let lastMessagePreview: string | null = null;
        for (const message of messages) {
          if (message.role === "assistant") {
            // Find text part in the message
            const textPart = message.parts.find(
              (part): part is { type: "text"; text: string } =>
                part.type === "text" && "text" in part,
            );
            if (textPart && textPart.text) {
              lastMessagePreview = textPart.text.slice(0, 60);
              if (textPart.text.length > 60) {
                lastMessagePreview += "...";
              }
              break;
            }
          }
        }

        return {
          ...thread,
          lastMessagePreview: lastMessagePreview || undefined,
        };
      }),
    );

    return threadsWithPreview;
  },
});
