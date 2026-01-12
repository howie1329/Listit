"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { ModelMessage, stepCountIs } from "ai";
import { ToolLoopAgent } from "ai";
import { tools } from "./tools/firecrawlAgent";
import { FALLBACK_MODELS, mapModelToOpenRouter } from "../lib/modelMapping";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateThreadResponse = action({
  args: {
    threadId: v.id("thread"),
  },
  handler: async (ctx, args) => {
    // Get the thread to verify ownership and get userId
    const thread = await ctx.runQuery(api.thread.queries.getSingleThread, {
      threadId: args.threadId,
    });

    if (!thread) {
      throw new Error("Thread not found");
    }

    // Verify ownership of the thread
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    if (thread.userId !== userId) {
      throw new Error("Not authorized");
    }

    // Fetch user settings to get defaultModel
    const userSettings = await ctx.runQuery(
      api.userFunctions.fetchUserSettings,
    );

    // Map user's defaultModel to OpenRouter format, with fallback
    const modelName =
      userSettings?.defaultModel != null
        ? mapModelToOpenRouter(userSettings.defaultModel)
        : FALLBACK_MODELS[0]; // fallback if settings not found

    const messages = await ctx.runQuery(
      api.threadMessages.queries.getThreadMessages,
      {
        threadId: args.threadId,
      },
    );

    if (!messages) {
      throw new Error("Messages not found");
    }
    const openRouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_AI_KEY,
    });

    const modelMessages: ModelMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    await ctx.runMutation(api.thread.mutations.updateThreadStreamingStatus, {
      threadId: args.threadId,
      streamingStatus: "streaming",
    });

    const assistantMessageId = await ctx.runMutation(
      api.threadMessages.mutations.addThreadMessage,
      {
        threadId: args.threadId,
        role: "assistant",
        content: "",
      },
    );

    const toolFunctions = tools(ctx, args.threadId, assistantMessageId);

    const chatAgent = new ToolLoopAgent({
      model: openRouter(modelName, {
        extraBody: {
          models: FALLBACK_MODELS,
        },
      }),
      instructions:
        "You are a helpful assistant that can answer questions." +
        "You can use the firecrawl tool to search the web for information." +
        "Only run the firecrawl tool one time. Do not run it multiple times." +
        "If you need to run firecrawl again, you must ask the user first.",
      tools: { firecrawl: toolFunctions.firecrawlTool },
      stopWhen: stepCountIs(10),
      temperature: 0.8,
    });

    const response = await chatAgent.stream({ messages: modelMessages });
    let fullResponse = "";
    let lastResponseTime = Date.now();
    for await (const chunk of response.textStream) {
      console.log("Chunk", chunk);
      fullResponse += chunk;
      if (Date.now() - lastResponseTime > 75) {
        await ctx.runMutation(
          api.threadMessages.mutations.updateThreadMessage,
          {
            threadMessageId: assistantMessageId,
            content: fullResponse,
          },
        );
        lastResponseTime = Date.now();
      }
    }

    if (fullResponse) {
      await ctx.runMutation(api.threadMessages.mutations.updateThreadMessage, {
        threadMessageId: assistantMessageId,
        content: fullResponse,
      });
      await ctx.runMutation(api.thread.mutations.updateThreadStreamingStatus, {
        threadId: args.threadId,
        streamingStatus: "idle",
      });
    }

    return fullResponse;
  },
});
