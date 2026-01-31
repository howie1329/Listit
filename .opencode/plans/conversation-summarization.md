# Conversation Summarization System - Implementation Plan

**Created:** January 30, 2026  
**Status:** Ready for Implementation  
**Priority:** High

---

## Overview

Implement a sophisticated conversation summarization system for the Vercel AI SDK chat to maintain context in long conversations. The system automatically generates structured JSON summaries and injects them into the agent's context window.

---

## Requirements Summary

### Core Functionality

- **Auto-trigger:** After 10 messages OR 2000 tokens (estimated word count × 1.3)
- **Manual trigger:** Via `@summarize` command
- **Summary format:** Structured JSON
- **Storage:** Multiple historical summaries (Option B)
- **Context injection:** Last 2 summaries + 4-10 recent messages
- **Summaries excluded:** From token count calculations

### Cost & Performance

- **Summarization models:** Use cheaper/free models
- **Cost tracking:** Track cost and token size of each summary
- **Display:** Show cost and token info in summary dialog
- **Failure handling:** Fallback models, continue on if all fail

### Content

- **Tool results:** Include if important but summarized
- **Message range:** Min 4, max 10 messages for agent context
- **UI feedback:** Show "generating summary" indicator and timestamp

---

## Database Schema Changes

### New Table: `threadSummaries`

```typescript
// convex/schema.ts

threadSummaries: defineTable({
  threadId: v.id("thread"),

  // Summary Content (Structured JSON)
  summary: v.object({
    overview: v.string(),           // Brief paragraph
    keyPoints: v.array(v.string()), // Important facts
    decisions: v.array(v.string()), // Decisions made
    actionItems: v.array(v.string()), // Action items with context
    openQuestions: v.array(v.string()), // Unresolved questions
    toolResults: v.array(v.object({
      toolName: v.string(),
      summary: v.string(),
      importance: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    })),
  }),

  // Message Range
  messageRange: v.object({
    fromMessageId: v.string(),      // First message ID in range
    toMessageId: v.string(),        // Last message ID in range
    messageCount: v.number(),       // Number of messages summarized
    fromIndex: v.number(),          // Start index in thread
    toIndex: v.number(),            // End index in thread
  }),

  // Token & Cost Tracking
  sourceTokenCount: v.number(),     // Tokens in source messages
  summaryTokenCount: v.number(),    // Tokens in generated summary
  costUsd: v.optional(v.number()),  // Cost in USD
  modelUsed: v.string(),            // Which model generated summary

  // Metadata
  triggerType: v.union(
    v.literal("auto"),              // Auto-triggered
    v.literal("manual")             // User-triggered via @summarize
  ),
  status: v.union(
    v.literal("generating"),        // Currently generating
    v.literal("completed"),         // Successfully completed
    v.literal("failed"),            // Failed even with fallbacks
    v.literal("partial")            // Completed with errors
  ),

  // Timestamps
  createdAt: v.string(),
  updatedAt: v.string(),

  // Error tracking (for failed/partial)
  errorInfo: v.optional(v.object({
    message: v.string(),
    fallbackAttempts: v.number(),
    lastAttemptModel: v.string(),
  })),
})
.index("by_threadId", ["threadId"])
.index("by_threadId_created", ["threadId", "createdAt"]),
```

### Update Table: `thread`

```typescript
// Add fields to thread table
thread: defineTable({
  // ... existing fields

  // Summary tracking (for quick checks)
  summaryCount: v.optional(v.number()), // Number of summaries
  lastSummaryAt: v.optional(v.string()), // Timestamp of last summary
  lastSummaryId: v.optional(v.id("threadSummaries")), // Reference to latest

  // Auto-trigger tracking
  messagesSinceLastSummary: v.optional(v.number()), // Counter for auto-trigger
  tokensSinceLastSummary: v.optional(v.number()), // Token counter
});
```

---

## Backend Implementation

### 1. New Convex Queries

**File:** `convex/threadSummaries/queries.ts`

```typescript
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
  returns: v.optional(threadSummaryValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.summaryId);
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
```

### 2. New Convex Mutations

**File:** `convex/threadSummaries/mutations.ts`

```typescript
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
      modelUsed: "",
      triggerType: args.triggerType,
      status: "generating",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      costUsd: args.costUsd,
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
  returns: v.union(
    v.object({ success: v.literal(true), summaryId: v.id("threadSummaries") }),
    v.object({ success: v.literal(false), reason: v.string() }),
  ),
  handler: async (ctx, args) => {
    // Check if already generating
    const existing = await ctx.db
      .query("threadSummaries")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("status"), "generating"))
      .first();

    if (existing) {
      return { success: false, reason: "Summarization already in progress" };
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
      };
    }

    // Get last summary to determine range
    const lastSummary = await ctx.db
      .query("threadSummaries")
      .withIndex("by_threadId_created", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .first();

    const startIndex = lastSummary
      ? messages.findIndex(
          (m) => m.id === lastSummary.messageRange.toMessageId,
        ) + 1
      : 0;

    const messagesToSummarize = messages.slice(startIndex);

    if (messagesToSummarize.length < 4) {
      return {
        success: false,
        reason: "Need at least 4 new messages since last summary",
      };
    }

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
        fromMessageId: messagesToSummarize[0].id,
        toMessageId: messagesToSummarize[messagesToSummarize.length - 1].id,
        messageCount: messagesToSummarize.length,
        fromIndex: startIndex,
        toIndex: messages.length - 1,
      },
      sourceTokenCount: estimateTokenCount(messagesToSummarize),
      summaryTokenCount: 0,
      modelUsed: "",
      triggerType: "manual",
      status: "generating",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Update thread
    await ctx.db.patch(args.threadId, {
      lastSummaryAt: new Date().toISOString(),
      lastSummaryId: summaryId,
      messagesSinceLastSummary: 0,
      tokensSinceLastSummary: 0,
    });

    return { success: true, summaryId };
  },
});
```

### 3. New Convex Actions

**File:** `convex/threadSummaries/actions.ts`

````typescript
// Generate summary using AI (with fallback models)
export const generateSummary = action({
  args: {
    summaryId: v.id("threadSummaries"),
    threadId: v.id("thread"),
  },
  handler: async (ctx, args) => {
    // Fetch messages to summarize
    const summary = await ctx.runQuery(
      api.threadSummaries.queries.getSummaryById,
      {
        summaryId: args.summaryId,
      },
    );

    if (!summary) throw new Error("Summary not found");

    const messages = await ctx.runQuery(
      api.uiMessages.queries.getMessagesInRange,
      {
        threadId: args.threadId,
        fromId: summary.messageRange.fromMessageId,
        toId: summary.messageRange.toMessageId,
      },
    );

    // Get previous summary for context (if exists)
    const previousSummaries = await ctx.runQuery(
      api.threadSummaries.queries.getLatestSummariesForContext,
      { threadId: args.threadId },
    );
    const previousSummary = previousSummaries.summaries[0];

    // Try generating with fallback models
    const models = [
      "meta-llama/llama-3.3-70b-instruct:free", // Free model
      "deepseek/deepseek-r1-0528:free", // Free model
      "arcee-ai/trinity-large-preview:free", // Free model
      "mistralai/ministral-8b", // Cheap model
    ];

    let lastError = null;
    let usedModel = null;
    let generatedSummary = null;
    let cost = 0;

    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      try {
        const result = await generateWithModel(
          model,
          messages,
          previousSummary,
        );
        generatedSummary = result.summary;
        cost = result.cost;
        usedModel = model;
        break;
      } catch (error) {
        lastError = error;
        console.warn(`Summary generation failed with model ${model}:`, error);
        continue;
      }
    }

    if (!generatedSummary) {
      // All models failed
      await ctx.runMutation(api.threadSummaries.mutations.failSummary, {
        summaryId: args.summaryId,
        errorInfo: {
          message: lastError?.message || "All fallback models failed",
          fallbackAttempts: models.length,
          lastAttemptModel: models[models.length - 1],
        },
      });
      return { success: false, error: lastError?.message };
    }

    // Calculate tokens
    const summaryText = JSON.stringify(generatedSummary);
    const summaryTokens = estimateTokens(summaryText);

    // Complete the summary
    await ctx.runMutation(api.threadSummaries.mutations.completeSummary, {
      summaryId: args.summaryId,
      summary: generatedSummary,
      summaryTokenCount: summaryTokens,
      costUsd: cost,
      modelUsed: usedModel,
    });

    return { success: true, summaryId: args.summaryId };
  },
});

// Helper function to generate with a specific model
async function generateWithModel(
  model: string,
  messages: any[],
  previousSummary: any,
) {
  const openRouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_AI_KEY,
  });

  const prompt = buildSummaryPrompt(messages, previousSummary);

  const result = await generateText({
    model: openRouter.chat(model),
    prompt,
    temperature: 0.3,
    maxTokens: 2000,
  });

  // Parse JSON response
  let summary;
  try {
    summary = JSON.parse(result.text);
  } catch {
    // Try to extract JSON from markdown code block
    const jsonMatch = result.text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      summary = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error("Failed to parse summary JSON");
    }
  }

  // Estimate cost (simplified)
  const cost =
    (result.usage?.promptTokens || 0) * 0.000001 +
    (result.usage?.completionTokens || 0) * 0.000002;

  return { summary, cost };
}

// Build the summarization prompt
function buildSummaryPrompt(messages: any[], previousSummary: any) {
  const messageTexts = messages
    .map((m) => {
      const text = m.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("\n");

      const toolResults = m.parts
        .filter((p: any) => p.type.startsWith("tool-"))
        .map((p: any) => `[${p.type}]: ${JSON.stringify(p.output || p.input)}`)
        .join("\n");

      return `${m.role}: ${text}${toolResults ? "\n" + toolResults : ""}`;
    })
    .join("\n\n---\n\n");

  return `You are a conversation summarizer. Create a structured JSON summary of the following conversation.

${previousSummary ? `Previous context summary:\n${JSON.stringify(previousSummary.summary, null, 2)}\n\n` : ""}Messages to summarize:
${messageTexts}

Create a JSON summary with this exact structure:
{
  "overview": "Brief 2-3 sentence overview of the main discussion",
  "keyPoints": ["Important fact 1", "Important fact 2", ...],
  "decisions": ["Decision made 1", "Decision made 2", ...],
  "actionItems": ["Action item with context", ...],
  "openQuestions": ["Unresolved question", ...],
  "toolResults": [
    {"toolName": "toolName", "summary": "What the tool did/returned", "importance": "high|medium|low"}
  ]
}

Guidelines:
- Overview: Capture the main topic and progression
- KeyPoints: Specific facts, information shared, or insights
- Decisions: Any choices made or conclusions reached
- ActionItems: Tasks, follow-ups, or next steps mentioned
- OpenQuestions: Questions raised but not answered
- ToolResults: Summarize important tool outputs, mark importance based on relevance
- Be concise but comprehensive
- Focus on information that would be relevant for continuing the conversation

Respond with ONLY the JSON object, no markdown formatting.`;
}

// Estimate token count (word count × 1.3)
function estimateTokens(text: string): number {
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount * 1.3);
}
````

---

## Frontend Implementation

### 1. New Component: Summary Dialog

**File:** `components/features/chat/SummaryDialog.tsx`

```typescript
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookOpen, RefreshCw, Sparkles, AlertCircle, Clock, DollarSign, Hash } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface SummaryDialogProps {
  threadId: Id<"thread">;
  hasSummary?: boolean;
}

export function SummaryDialog({ threadId, hasSummary }: SummaryDialogProps) {
  const [open, setOpen] = useState(false);

  const summaries = useQuery(api.threadSummaries.queries.getThreadSummaries, { threadId });
  const isGenerating = useQuery(api.threadSummaries.queries.isSummarizationInProgress, { threadId });
  const manualSummarize = useMutation(api.threadSummaries.mutations.manualSummarize);

  const latestSummary = summaries?.[0];
  const previousSummary = summaries?.[1];

  const handleManualSummarize = async () => {
    try {
      const result = await manualSummarize({ threadId });
      if (result.success) {
        toast.success("Generating summary...");
      } else {
        toast.error(result.reason);
      }
    } catch (error) {
      toast.error("Failed to trigger summarization");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "generating":
        return (
          <Badge variant="outline" className="animate-pulse">
            <Sparkles className="mr-1 h-3 w-3" />
            Generating...
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            Complete
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      case "partial":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            Partial
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatCost = (cost?: number) => {
    if (!cost) return "Free";
    return `$${cost.toFixed(6)}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="h-4 w-4" />
          {hasSummary ? "View Summary" : "No Summary"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Conversation Summary
            {latestSummary && getStatusBadge(latestSummary.status)}
          </DialogTitle>
          <DialogDescription>
            AI-generated summary of your conversation history
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh] pr-4">
          {isGenerating && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Sparkles className="h-4 w-4 animate-spin" />
                <span className="font-medium">Generating summary...</span>
              </div>
              <p className="text-sm text-blue-600/80 dark:text-blue-400/80 mt-1">
                This may take a few moments
              </p>
            </div>
          )}

          {latestSummary?.status === "failed" && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Summary generation failed</span>
              </div>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                {latestSummary.errorInfo?.message || "Unknown error"}
              </p>
            </div>
          )}

          {latestSummary?.status === "completed" && (
            <div className="space-y-6">
              {/* Metadata */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(latestSummary.createdAt), { addSuffix: true })}
                </div>
                <div className="flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  {latestSummary.sourceTokenCount.toLocaleString()} tokens
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatCost(latestSummary.costUsd)}
                </div>
                <Badge variant="outline">{latestSummary.modelUsed}</Badge>
              </div>

              {/* Overview */}
              <div>
                <h4 className="font-semibold mb-2">Overview</h4>
                <p className="text-sm leading-relaxed">{latestSummary.summary.overview}</p>
              </div>

              {/* Key Points */}
              {latestSummary.summary.keyPoints.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Key Points</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {latestSummary.summary.keyPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Decisions */}
              {latestSummary.summary.decisions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Decisions Made</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {latestSummary.summary.decisions.map((decision, i) => (
                      <li key={i}>{decision}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {latestSummary.summary.actionItems.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Action Items</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {latestSummary.summary.actionItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tool Results */}
              {latestSummary.summary.toolResults.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tool Results</h4>
                  <div className="space-y-2">
                    {latestSummary.summary.toolResults.map((tool, i) => (
                      <div key={i} className="p-2 bg-muted rounded text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {tool.toolName}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              tool.importance === "high"
                                ? "border-red-500 text-red-600"
                                : tool.importance === "medium"
                                ? "border-yellow-500 text-yellow-600"
                                : "border-green-500 text-green-600"
                            }`}
                          >
                            {tool.importance}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{tool.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Previous Summary Context */}
              {previousSummary && (
                <>
                  <Separator />
                  <div className="opacity-60">
                    <h4 className="font-semibold mb-2">Previous Context</h4>
                    <p className="text-sm leading-relaxed">{previousSummary.summary.overview}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {!latestSummary && !isGenerating && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No summary yet.</p>
              <p className="text-sm mt-1">
                Summaries are generated automatically after 10 messages or 2,000 tokens.
              </p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {latestSummary?.status === "completed" && (
              <>Generated {formatDistanceToNow(new Date(latestSummary.createdAt), { addSuffix: true })}</>
            )}
          </div>
          <div className="flex gap-2">
            {latestSummary?.status === "completed" && (
              <Button variant="outline" onClick={handleManualSummarize} disabled={isGenerating}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            )}
            <Button onClick={handleManualSummarize} disabled={isGenerating}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "Summarize Now"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. Update Chat Page

**File:** `app/(app)/chat/page.tsx`

Add summary dialog to the chat interface:

```typescript
// Add imports
import { SummaryDialog } from "@/components/features/chat/SummaryDialog";

// Add to the header section
<div className="flex items-center justify-between">
  <h1 className="text-center">Chat</h1>
  {selectedThread && (
    <SummaryDialog
      threadId={selectedThread}
      hasSummary={sortedThreads?.find(t => t._id === selectedThread)?.summaryCount > 0}
    />
  )}
</div>
```

### 3. Command Detection (@summarize)

**File:** `components/features/mastra/ChatBaseInput.tsx`

Add command detection for @summarize:

```typescript
// Add to detected commands
const detectedCommands = useMemo(() => {
  const commands = [];
  const text = input.toLowerCase();

  // ... existing commands

  if (text.includes("@summarize")) {
    commands.push({ type: "@summarize", index: text.indexOf("@summarize") });
  }

  return commands.sort((a, b) => a.index - b.index);
}, [input]);

// Add label and color
const getCommandLabel = (type: string) => {
  switch (type) {
    // ... existing cases
    case "@summarize":
      return "Summarize Conversation";
    default:
      return type;
  }
};

const getCommandColor = (type: string) => {
  switch (type) {
    // ... existing cases
    case "@summarize":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    default:
      return "";
  }
};
```

---

## API Route Modifications

**File:** `app/api/chat/route.ts`

### 1. Add Summary Context Injection

```typescript
// Add imports
import {
  estimateTokenCount,
  getMessagesWithSummaries,
} from "@/lib/chat/summary-utils";

// Modify the POST handler to include summaries
export async function POST(request: Request) {
  // ... existing setup

  // Get messages for context (with summaries)
  const { recentMessages, summaries, totalTokens } =
    await getMessagesWithSummaries(
      convex,
      threadId,
      4, // min messages
      10, // max messages
    );

  // Build system prompt with summaries
  const summaryContext =
    summaries.length > 0
      ? `## Previous Conversation Context\n\n${summaries
          .map(
            (s, i) =>
              `### Summary ${i + 1} (${new Date(s.createdAt).toLocaleDateString()}):\n${s.summary.overview}\n\nKey points: ${s.summary.keyPoints.join(", ")}`,
          )
          .join("\n\n")}\n\n`
      : "";

  const instructions = `
    You are the main agent for this application...
    
    ${summaryContext}
    
    ## Recent Messages (Last ${recentMessages.length}):
    ${recentMessages.map((m) => `${m.role}: ${m.content}`).join("\n\n")}
    
    ===============================================
    Working Memory:
    ${workingMemory ? JSON.stringify(workingMemory) : "No working memory found"}
    ...
  `;

  // Check if we should auto-trigger summarization
  const shouldSummarize = await checkAutoSummarizeTrigger(
    convex,
    threadId,
    recentMessages,
    summaries,
  );

  if (shouldSummarize.shouldTrigger) {
    // Trigger background summarization
    await triggerBackgroundSummarization(
      convex,
      threadId,
      shouldSummarize.messageRange,
    );
  }

  // ... rest of existing code
}
```

### 2. Summary Trigger Logic

```typescript
// Add to the route file or lib/chat/summary-utils.ts

async function checkAutoSummarizeTrigger(
  convex: ConvexHttpClient,
  threadId: string,
  recentMessages: any[],
  existingSummaries: any[],
) {
  // Get thread info
  const thread = await convex.query(api.thread.queries.getSingleThread, {
    threadId,
  });

  const messagesSinceLastSummary = thread?.messagesSinceLastSummary || 0;
  const tokensSinceLastSummary = thread?.tokensSinceLastSummary || 0;

  // Calculate tokens in recent messages (excluding summaries)
  const recentTokens = recentMessages.reduce((acc, m) => {
    const text = m.parts
      .filter((p: any) => p.type === "text" || p.type.startsWith("tool-"))
      .map((p: any) => p.text || JSON.stringify(p.output || p.input))
      .join(" ");
    return acc + estimateTokenCount(text);
  }, 0);

  const totalMessages = messagesSinceLastSummary + recentMessages.length;
  const totalTokens = tokensSinceLastSummary + recentTokens;

  // Check thresholds
  const messageThreshold = 10;
  const tokenThreshold = 2000;

  if (totalMessages >= messageThreshold || totalTokens >= tokenThreshold) {
    return {
      shouldTrigger: true,
      messageRange: {
        fromIndex:
          existingSummaries.length > 0
            ? existingSummaries[0].messageRange.toIndex + 1
            : 0,
        toIndex: totalMessages - 1,
        messageCount: totalMessages,
      },
    };
  }

  // Update counters
  await convex.mutation(api.threadSummaries.mutations.updateThreadCounters, {
    threadId: threadId as any,
    messageCount: recentMessages.length,
    tokenCount: recentTokens,
  });

  return { shouldTrigger: false };
}

async function triggerBackgroundSummarization(
  convex: ConvexHttpClient,
  threadId: string,
  messageRange: any,
) {
  // Get the actual message IDs
  const messages = await convex.query(api.uiMessages.queries.getUIMessages, {
    threadId,
  });
  const messagesToSummarize = messages.slice(
    messageRange.fromIndex,
    messageRange.toIndex + 1,
  );

  if (messagesToSummarize.length < 4) return;

  // Create summary record
  const summaryId = await convex.mutation(
    api.threadSummaries.mutations.createSummary,
    {
      threadId: threadId as any,
      triggerType: "auto",
      messageRange: {
        fromMessageId: messagesToSummarize[0].id,
        toMessageId: messagesToSummarize[messagesToSummarize.length - 1].id,
        messageCount: messagesToSummarize.length,
        fromIndex: messageRange.fromIndex,
        toIndex: messageRange.toIndex,
      },
      sourceTokenCount:
        messageRange.tokenCount ||
        estimateTokenCount(
          messagesToSummarize
            .map((m) =>
              m.parts
                .filter((p: any) => p.type === "text")
                .map((p: any) => p.text)
                .join(" "),
            )
            .join(" "),
        ),
    },
  );

  // Trigger background action
  await convex.action(api.threadSummaries.actions.generateSummary, {
    summaryId,
    threadId: threadId as any,
  });
}

function estimateTokenCount(text: string): number {
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  return Math.ceil(wordCount * 1.3);
}
```

---

## New Utility Files

### 1. Summary Utilities

**File:** `lib/chat/summary-utils.ts`

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function getMessagesWithSummaries(
  convex: ConvexHttpClient,
  threadId: string,
  minMessages: number = 4,
  maxMessages: number = 10,
) {
  // Get all messages
  const allMessages = await convex.query(api.uiMessages.queries.getUIMessages, {
    threadId,
  });

  // Get latest 2 summaries
  const { summaries } = await convex.query(
    api.threadSummaries.queries.getLatestSummariesForContext,
    { threadId },
  );

  // Determine message range to include
  let startIndex = 0;
  if (summaries.length > 0) {
    const lastSummary = summaries[0];
    startIndex = lastSummary.messageRange.toIndex + 1;
  }

  // Calculate how many messages to include
  const messagesAfterSummary = allMessages.slice(startIndex);
  const messagesToInclude = Math.max(
    minMessages,
    Math.min(maxMessages, messagesAfterSummary.length),
  );

  // Get the recent messages
  const recentMessages = allMessages.slice(-messagesToInclude);

  // Calculate total tokens
  const totalTokens = recentMessages.reduce((acc, m) => {
    const text = m.parts
      .filter((p: any) => p.type === "text" || p.type.startsWith("tool-"))
      .map((p: any) => p.text || JSON.stringify(p.output || p.input))
      .join(" ");
    return acc + estimateTokenCount(text);
  }, 0);

  return {
    recentMessages,
    summaries,
    totalTokens,
  };
}

export function estimateTokenCount(text: string): number {
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  return Math.ceil(wordCount * 1.3);
}
```

---

## Implementation Phases

### Phase 1: Database & Backend (Day 1-2)

1. ✅ Update `convex/schema.ts` with new `threadSummaries` table
2. ✅ Add fields to `thread` table for counters
3. ✅ Create `convex/threadSummaries/queries.ts`
4. ✅ Create `convex/threadSummaries/mutations.ts`
5. ✅ Create `convex/threadSummaries/actions.ts` with fallback logic
6. ✅ Update `convex/thread/queries.ts` to include summary count
7. ✅ Create `lib/chat/summary-utils.ts`

### Phase 2: API Integration (Day 2-3)

8. ✅ Modify `app/api/chat/route.ts` to:
   - Load summaries + recent messages
   - Inject summaries into system prompt
   - Check auto-trigger conditions
   - Trigger background summarization

### Phase 3: Frontend (Day 3-4)

9. ✅ Create `components/features/chat/SummaryDialog.tsx`
10. ✅ Update `app/(app)/chat/page.tsx` to include SummaryDialog
11. ✅ Update `components/features/mastra/ChatBaseInput.tsx` for @summarize command
12. ✅ Add loading states and error handling in UI

### Phase 4: Testing & Polish (Day 4-5)

13. ✅ Test auto-trigger (10 messages)
14. ✅ Test auto-trigger (2000 tokens)
15. ✅ Test manual trigger (@summarize)
16. ✅ Test fallback model behavior
17. ✅ Test cost tracking display
18. ✅ Test dialog UI and interactions
19. ✅ Add error boundaries and edge case handling

---

## Testing Strategy

### Unit Tests

- Token estimation function
- Message range calculation
- Summary formatting

### Integration Tests

- Auto-trigger on message threshold
- Auto-trigger on token threshold
- Manual trigger via @summarize
- Fallback model selection
- Cost calculation accuracy

### E2E Tests

- Full summarization flow
- Dialog interactions
- Context injection in responses
- Error handling (failed summarization)

---

## Monitoring & Debugging

Add logging for:

- When summarization is triggered (auto vs manual)
- Which model was used
- Token counts (source and summary)
- Costs
- Failures and fallback attempts

```typescript
console.log(`[Summary] ${triggerType} triggered for thread ${threadId}`);
console.log(
  `[Summary] Model: ${modelUsed}, Tokens: ${sourceTokens} → ${summaryTokens}`,
);
console.log(`[Summary] Cost: $${costUsd}, Status: ${status}`);
```

---

## Success Metrics

- ✅ Summaries generated within 5-10 seconds
- ✅ Token reduction: 80-90% (2000 tokens → 200-400 token summary)
- ✅ Context retention: Agent maintains conversation flow with summaries
- ✅ User satisfaction: Manual trigger used < 20% (auto works well)
- ✅ Cost efficiency: < $0.001 per summary (using free/cheap models)

---

**Ready for Implementation!** This plan covers all your requirements with a robust, scalable architecture.
