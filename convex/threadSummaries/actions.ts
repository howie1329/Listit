import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { generateText, Output } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

// Generate summary using AI (with fallback models)
export const generateSummary = action({
  args: {
    summaryId: v.id("threadSummaries"),
    threadId: v.id("thread"),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      // Fetch the summary record
      const summary = await ctx.runQuery(
        api.threadSummaries.queries.getSummaryById,
        {
          summaryId: args.summaryId,
        },
      );

      if (!summary) {
        return { success: false, error: "Summary not found" };
      }

      // Fetch messages to summarize
      const messages = await ctx.runQuery(
        api.threadSummaries.queries.getMessagesInRange,
        {
          threadId: args.threadId,
          fromId: summary.messageRange.fromMessageId,
          toId: summary.messageRange.toMessageId,
        },
      );

      console.log("messages", messages);


      // Get previous summary for context (if exists)
      const previousSummaries = await ctx.runQuery(
        api.threadSummaries.queries.getLatestSummariesForContext,
        { threadId: args.threadId },
      );
      const previousSummary = previousSummaries.summaries[0];

      // Try generating with fallback models (free/cheap models)
      const models = [
        "arcee-ai/trinity-large-preview:free", // Free model
        "deepseek/deepseek-r1-0528:free", // Free model
        "mistralai/ministral-8b", // Cheap model
      ];

      let lastError: Error | null = null;
      let usedModel: string | null = null;
      let generatedSummary = null;
      let cost = 0;

      try {
        const result = await generateWithModel(
          models,
          messages,
          previousSummary,
        );
        generatedSummary = result.summary;
        cost = result.cost;
        usedModel = result.model;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `[Summary] Generation failed with all models`,
          error,
        );
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
        modelUsed: usedModel || "unknown",
      });

      console.log(
        `[Summary] Generated for thread ${args.threadId}: ${summaryTokens} tokens, $${cost.toFixed(6)}`,
      );

      return { success: true };
    } catch (error) {
      console.error("[Summary] Unexpected error:", error);
      return { success: false, error: String(error) };
    }
  },
});

// Helper function to generate with a specific model
async function generateWithModel(
  models: string[],
  messages: any[],
  previousSummary: any | null,
) {
  const openRouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_AI_KEY!,
  });

  const prompt = buildSummaryPrompt(messages, previousSummary);

  const { output, usage, response } = await generateText({
    model: openRouter.chat(models[0], {
      extraBody: { models: models },
      usage: { include: true },
    }),
    prompt,
    temperature: 0.3,
    maxOutputTokens: 2000,
    output: Output.object({
      schema: z.object({
        summary: z.object({
          overview: z.string(),
          keyPoints: z.array(z.string()),
          decisions: z.array(z.string()),
          actionItems: z.array(z.string()),
          openQuestions: z.array(z.string()),
          toolResults: z.array(z.object({
            toolName: z.string(),
            summary: z.string(),
            importance: z.enum(["high", "medium", "low"]),
          })),
        }),
      }),
    })
  })

  // Validate summary structure
  if (!output.summary.overview || !Array.isArray(output.summary.keyPoints)) {
    throw new Error("Invalid summary structure");
  }

  // Estimate cost (simplified pricing)
  const usageData = usage as {
    promptTokens?: number;
    completionTokens?: number;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };

  const promptTokens = usageData.promptTokens ?? usageData.inputTokens ?? 0;
  const completionTokens = usageData.completionTokens ?? usageData.outputTokens ?? 0;
  const promptCost = promptTokens * 0.0000001; // $0.10 per 1M prompt tokens
  const completionCost = completionTokens * 0.0000004; // $0.40 per 1M completion tokens
  const cost = promptCost + completionCost;
  const model = response.modelId;

  return { summary: output.summary, cost, model };
}

// Build the summarization prompt
function buildSummaryPrompt(messages: any[], previousSummary: any | null) {
  const messageTexts = messages
    .map((m) => {
      const text = m.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("\n");

      const toolResults = m.parts
        .filter((p: any) => p.type.startsWith("tool-"))
        .map((p: any) => {
          const toolName = p.type.replace("tool-", "");
          const output = p.output
            ? JSON.stringify(p.output).substring(0, 200)
            : "pending...";
          return `[Tool: ${toolName}]: ${output}`;
        })
        .join("\n");

      return `${m.role}: ${text}${toolResults ? "\n" + toolResults : ""}`;
    })
    .join("\n\n---\n\n");

  return `You are a conversation summarizer. Create a structured JSON summary of the following conversation.

${previousSummary
      ? `Previous context summary (for reference, do not duplicate):
Overview: ${previousSummary.summary.overview}
Key Points: ${previousSummary.summary.keyPoints.join(", ")}

`
      : ""
    }Messages to summarize:
${messageTexts}

Create a JSON summary with this exact structure:
{
  "summary": {
    "overview": "Brief 2-3 sentence overview of the main discussion",
    "keyPoints": ["Important fact 1", "Important fact 2", ...],
    "decisions": ["Decision made 1", "Decision made 2", ...],
    "actionItems": ["Action item with context", ...],
    "openQuestions": ["Unresolved question", ...],
    "toolResults": [
      {"toolName": "toolName", "summary": "What the tool did/returned (max 100 chars)", "importance": "high|medium|low"}
    ]
  }
}

Guidelines:
- Overview: Capture the main topic and progression (focus on NEW information since previous summary)
- KeyPoints: Specific facts, information shared, or insights (3-7 points)
- Decisions: Any choices made or conclusions reached (can be empty if none)
- ActionItems: Tasks, follow-ups, or next steps mentioned (include context)
- OpenQuestions: Questions raised but not answered (can be empty)
- ToolResults: Only include if important - summarize tool outputs, mark importance based on relevance to conversation
- Be concise but comprehensive
- Focus on information that would be relevant for continuing the conversation
- If this is a continuation, focus on NEW information since the previous summary

Respond with ONLY the JSON object, no markdown formatting, no explanations.`;
}

// Estimate token count (word count × 1.3)
function estimateTokens(text: string): number {
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  return Math.ceil(wordCount * 1.3);
}
