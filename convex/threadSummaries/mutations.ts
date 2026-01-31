import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

// Create new summary (sets status to "generating")
export const createSummary = mutation({
  args: {
    threadId: v.id("thread"),
    triggerType: v.union(v.literal("auto"), v.literal("manual")),
    messageRange: v.object({
      fromMessageId: v.string(),
      toMessageId: v.string(),
      messageCount: v.number(),
      fromIndex: v.number(),
      toIndex: v.number(),
    }),
    sourceTokenCount: v.number(),
  },
  returns: v.id("threadSummaries"),
  handler: async (ctx, args) => {
    const summaryId = await ctx.db.insert("threadSummaries", {
      threadId: args.threadId,
      summary: {
        overview: "",
        keyPoints: [],
        decisions: [],
        actionItems: [],
        openQuestions: [],
        toolResults: [],
      },
      messageRange: args.messageRange,
      sourceTokenCount: args.sourceTokenCount,
      summaryTokenCount: 0,
      costUsd: null,
      modelUsed: "",
      triggerType: args.triggerType,
      status: "generating",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      errorInfo: null,
    });

    // Update thread counters
    await ctx.db.patch(args.threadId, {
      lastSummaryAt: new Date().toISOString(),
      lastSummaryId: summaryId,
      messagesSinceLastSummary: 0,
      tokensSinceLastSummary: 0,
    });

    return summaryId;
  },
});

// Update summary after generation
export const completeSummary = mutation({
  args: {
    summaryId: v.id("threadSummaries"),
    summary: v.object({
      overview: v.string(),
      keyPoints: v.array(v.string()),
      decisions: v.array(v.string()),
      actionItems: v.array(v.string()),
      openQuestions: v.array(v.string()),
      toolResults: v.array(
        v.object({
          toolName: v.string(),
          summary: v.string(),
          importance: v.union(
            v.literal("high"),
            v.literal("medium"),
            v.literal("low"),
          ),
        }),
      ),
    }),
    summaryTokenCount: v.number(),
    costUsd: v.optional(v.number()),
    modelUsed: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.summaryId, {
      summary: args.summary,
      summaryTokenCount: args.summaryTokenCount,
      costUsd: args.costUsd ?? null,
      modelUsed: args.modelUsed,
      status: "completed",
      updatedAt: new Date().toISOString(),
    });

    // Update thread summary count
    const summary = await ctx.db.get(args.summaryId);
    if (summary) {
      const thread = await ctx.db.get(summary.threadId);
      if (thread) {
        await ctx.db.patch(summary.threadId, {
          summaryCount: (thread.summaryCount || 0) + 1,
        });
      }
    }
  },
});

// Mark summary as failed
export const failSummary = mutation({
  args: {
    summaryId: v.id("threadSummaries"),
    errorInfo: v.object({
      message: v.string(),
      fallbackAttempts: v.number(),
      lastAttemptModel: v.string(),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.summaryId, {
      status: "failed",
      errorInfo: args.errorInfo,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Update thread counters for auto-trigger
export const updateThreadCounters = mutation({
  args: {
    threadId: v.id("thread"),
    messageCount: v.number(),
    tokenCount: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread) return;

    await ctx.db.patch(args.threadId, {
      messagesSinceLastSummary:
        (thread.messagesSinceLastSummary || 0) + args.messageCount,
      tokensSinceLastSummary:
        (thread.tokensSinceLastSummary || 0) + args.tokenCount,
    });
  },
});

// Manual trigger (for @summarize command)
export const manualSummarize = mutation({
  args: { threadId: v.id("thread") },
  returns: v.object({
    success: v.boolean(),
    summaryId: v.optional(v.id("threadSummaries")),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    // Check if already generating
    const existing = await ctx.db
      .query("threadSummaries")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("status"), "generating"))
      .first();

    if (existing) {
      return {
        success: false,
        reason: "Summarization already in progress",
        summaryId: undefined,
      };
    }

    // Get messages to summarize
    const messages = await ctx.db
      .query("uiMessages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();

    if (messages.length < 4) {
      return {
        success: false,
        reason: "Need at least 4 messages to summarize",
        summaryId: undefined,
      };
    }

    // Get last summary to determine range
    const lastSummary = await ctx.db
      .query("threadSummaries")
      .withIndex("by_threadId_created", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .first();

    // Sort messages by updatedAt
    messages.sort(
      (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    );

    const lastSummaryIndex = lastSummary
      ? messages.findIndex(
          (m) => m._id === lastSummary.messageRange.toMessageId,
        )
      : -1;

    let startIndex = lastSummaryIndex >= 0 ? lastSummaryIndex + 1 : 0;
    let messagesToSummarize = messages.slice(startIndex);

    console.log("messagesToSummarize", messagesToSummarize);

    if (messagesToSummarize.length === 0) {
      if (messages.length === 0) {
        return {
          success: false,
          reason: "No messages available to summarize",
          summaryId: undefined,
        };
      }
      startIndex = Math.max(0, messages.length - 4);
      messagesToSummarize = messages.slice(startIndex);
    }

    // Calculate source tokens
    const sourceTokenCount = messagesToSummarize.reduce((acc, m) => {
      const text = m.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join(" ");
      return (
        acc +
        Math.ceil(
          text.split(/\s+/).filter((w: string) => w.length > 0).length * 1.3,
        )
      );
    }, 0);

    // Create summary record
    const summaryId = await ctx.db.insert("threadSummaries", {
      threadId: args.threadId,
      summary: {
        overview: "",
        keyPoints: [],
        decisions: [],
        actionItems: [],
        openQuestions: [],
        toolResults: [],
      },
      messageRange: {
        fromMessageId: messagesToSummarize[0]._id,
        toMessageId: messagesToSummarize[messagesToSummarize.length - 1]._id,
        messageCount: messagesToSummarize.length,
        fromIndex: startIndex,
        toIndex: messages.length - 1,
      },
      sourceTokenCount,
      summaryTokenCount: 0,
      costUsd: null,
      modelUsed: "",
      triggerType: "manual",
      status: "generating",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      errorInfo: null,
    });

    // Update thread
    await ctx.db.patch(args.threadId, {
      lastSummaryAt: new Date().toISOString(),
      lastSummaryId: summaryId,
      messagesSinceLastSummary: 0,
      tokensSinceLastSummary: 0,
    });

    await ctx.scheduler.runAfter(
      0,
      api.threadSummaries.actions.generateSummary,
      {
        summaryId,
        threadId: args.threadId,
      },
    );

    return { success: true, summaryId };
  },
});
