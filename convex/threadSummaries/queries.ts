import { query } from "../_generated/server";
import { v } from "convex/values";
import { threadSummaryValidator } from "../schema";

// Get all summaries for a thread (newest first)
export const getThreadSummaries = query({
  args: { threadId: v.id("thread") },
  returns: v.array(threadSummaryValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("threadSummaries")
      .withIndex("by_threadId_created", (q) => q.eq("threadId", args.threadId))
      .order("desc")
      .take(10); // Last 10 summaries max
  },
});

// Get latest 2 summaries for context injection
export const getLatestSummariesForContext = query({
  args: { threadId: v.id("thread") },
  returns: v.object({
    summaries: v.array(threadSummaryValidator),
    hasActiveSummary: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const summaries = await ctx.db
      .query("threadSummaries")
      .withIndex("by_threadId_created", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .take(2);

    return {
      summaries,
      hasActiveSummary: summaries.length > 0,
    };
  },
});

// Get summary by ID with full details
export const getSummaryById = query({
  args: { summaryId: v.id("threadSummaries") },
  returns: v.union(threadSummaryValidator, v.null()),
  handler: async (ctx, args) => {
    const summary = await ctx.db.get(args.summaryId);
    return summary ?? null;
  },
});

// Check if summarization is in progress
export const isSummarizationInProgress = query({
  args: { threadId: v.id("thread") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const generating = await ctx.db
      .query("threadSummaries")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("status"), "generating"))
      .first();
    return !!generating;
  },
});

// Get messages in a specific range (for summarization context)
export const getMessagesInRange = query({
  args: {
    threadId: v.id("thread"),
    fromId: v.string(),
    toId: v.string(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const allMessages = await ctx.db
      .query("uiMessages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();

    // Sort by updatedAt
    allMessages.sort(
      (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    );

    // Find range
    const fromIndex = allMessages.findIndex((m) => m._id === args.fromId);
    const toIndex = allMessages.findIndex((m) => m._id === args.toId);

    if (fromIndex === -1 || toIndex === -1) {
      return [];
    }

    return allMessages.slice(fromIndex, toIndex + 1);
  },
});
