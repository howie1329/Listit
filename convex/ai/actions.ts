"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, ModelMessage, stepCountIs } from "ai";
import { firecrawlTool } from "./tools/firecrawlAgent";
import { Experimental_Agent as agent } from "ai";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateThreadResponse = action({
  args: {
    threadId: v.id("thread"),
    usersMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.runQuery(api.thread.queries.getSingleThread, {
      threadId: args.threadId,
    });
    if (!thread) {
      throw new Error("Thread not found");
    }
    await ctx.runMutation(api.threadMessages.mutations.addThreadMessage, {
      threadId: args.threadId,
      role: "user",
      content: args.usersMessage,
    });
    const messages = await ctx.runQuery(
      api.threadMessages.queries.getThreadMessages,
      {
        threadId: args.threadId,
      },
    );

    console.log("Messages", messages);
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

    console.log("Model Messages", modelMessages);

    const assistantMessageId = await ctx.runMutation(
      api.threadMessages.mutations.addThreadMessage,
      {
        threadId: args.threadId,
        role: "assistant",
        content: "",
      },
    );

    const chatAgent = new agent({
      model: openRouter("openai/gpt-5-nano", {
        extraBody: {
          models: ["openai/gpt-oss-20b"],
        },
      }),
      system:
        "You are a helpful assistant that can answer questions." +
        "You can use the firecrawl tool to search the web for information." +
        "Only run the firecrawl tool one time. Do not run it multiple times." +
        "If you need to run firecrawl again, you must ask the user first.",
      tools: { firecrawl: firecrawlTool },
      stopWhen: stepCountIs(10),
      temperature: 0.8,
    });

    const response = chatAgent.stream({ messages: modelMessages });
    let fullResponse = "";
    let lastResponseTime = Date.now();
    console.log("Streaming response...", response.textStream);
    for await (const chunk of response.textStream) {
      console.log("Chunk", chunk);
      fullResponse += chunk;
      if (Date.now() - lastResponseTime > 75) {
        console.log("Updating response...", fullResponse);
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
    }

    return fullResponse;
  },
});
