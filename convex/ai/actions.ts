import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, generateText, ModelMessage } from "ai";

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

    const response = await generateText({
      model: openRouter("openai/gpt-5-nano", {
        extraBody: {
          models: ["openai/gpt-oss-20b"],
        },
      }),
      system:
        "You are a helpful assistant that can answer questions and help with tasks.",
      messages: modelMessages as ModelMessage[],
    });

    console.log("Response", response.text);

    await ctx.runMutation(api.threadMessages.mutations.addThreadMessage, {
      threadId: args.threadId,
      role: "assistant",
      content: response.text,
    });

    return response.text;
  },
});
