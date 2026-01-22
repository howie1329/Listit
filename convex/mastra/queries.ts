import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all messages for a specific Mastra thread.
 * Use this when reading messages stored via Mastra's memory system.
 */
export const getMastraThreadMessages = query({
  args: {
    threadId: v.string(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("mastra_messages")
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .collect();

    // Sort by creation time ascending (oldest first)
    return messages.sort(
      (a, b) =>
        new Date(a.createdAt as string).getTime() -
        new Date(b.createdAt as string).getTime(),
    );
  },
});

/**
 * Get all Mastra threads for a specific resource (user).
 * The resourceId is typically the user ID passed to memory.resource.
 */
export const getMastraThreads = query({
  args: {
    resourceId: v.string(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const threads = await ctx.db
      .query("mastra_threads")
      .filter((q) => q.eq(q.field("resourceId"), args.resourceId))
      .collect();

    // Sort by update time descending (most recent first)
    return threads.sort(
      (a, b) =>
        new Date(b.updatedAt as string).getTime() -
        new Date(a.updatedAt as string).getTime(),
    );
  },
});

/**
 * Get a single Mastra thread by ID.
 */
export const getMastraThread = query({
  args: {
    threadId: v.string(),
  },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("mastra_threads")
      .filter((q) => q.eq(q.field("id"), args.threadId))
      .first();

    return thread ?? null;
  },
});
