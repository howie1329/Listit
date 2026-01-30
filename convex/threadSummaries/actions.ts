import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

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
        "arcee-ai/trinity-large-preview:free", // Free model
        "mistralai/ministral-8b", // Cheap model
      ];

      let lastError: Error | null = null;
      let usedModel: string | null = null;
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
          lastError = error as Error;
          console.warn(
            `[Summary] Generation failed with model ${model}:`,
            error,
          );
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
  model: string,
  messages: any[],
  previousSummary: any | null,
) {
  const openRouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_AI_KEY!,
  });

  const prompt = buildSummaryPrompt(messages, previousSummary);

  const result = await generateText({
    model: openRouter.chat(model),
    prompt,
    temperature: 0.3,
    maxOutputTokens: 2000,
  });

  // Parse JSON response
  let summary;
  try {
    summary = JSON.parse(result.text);
  } catch {
    // Try to extract JSON from markdown code block
    const jsonMatch = result.text.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      summary = JSON.parse(jsonMatch[1]);
    } else {
      // Try to extract JSON from plain text
      const jsonStart = result.text.indexOf("{");
      const jsonEnd = result.text.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        summary = JSON.parse(result.text.substring(jsonStart, jsonEnd + 1));
      } else {
        throw new Error("Failed to parse summary JSON");
      }
    }
  }

  // Validate summary structure
  if (!summary.overview || !Array.isArray(summary.keyPoints)) {
    throw new Error("Invalid summary structure");
  }

  // Estimate cost (simplified pricing)
  const usage = result.usage as {
    promptTokens?: number;
    completionTokens?: number;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };

  const promptTokens = usage.promptTokens ?? usage.inputTokens ?? 0;
  const completionTokens = usage.completionTokens ?? usage.outputTokens ?? 0;
  const promptCost = promptTokens * 0.0000001; // $0.10 per 1M prompt tokens
  const completionCost = completionTokens * 0.0000004; // $0.40 per 1M completion tokens
  const cost = promptCost + completionCost;

  return { summary, cost };
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
  "overview": "Brief 2-3 sentence overview of the main discussion",
  "keyPoints": ["Important fact 1", "Important fact 2", ...],
  "decisions": ["Decision made 1", "Decision made 2", ...],
  "actionItems": ["Action item with context", ...],
  "openQuestions": ["Unresolved question", ...],
  "toolResults": [
    {"toolName": "toolName", "summary": "What the tool did/returned (max 100 chars)", "importance": "high|medium|low"}
  ]
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
