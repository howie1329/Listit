import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { secondTool } from "@/convex/ai/tools/firecrawlAgent";
import {
  FALLBACK_MODELS,
  mapModelToOpenRouter,
} from "@/convex/lib/modelMapping";
import type { DefaultModel } from "@/convex/lib/modelMapping";

export async function POST(request: Request) {
  const openRouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_AI_KEY,
  });

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  const { messages, threadId, model } = await request.json();

  if (!messages || messages.length === 0) {
    return new Response("No messages provided", { status: 400 });
  }

  const userMessage = messages[messages.length - 1].parts[0].text;
  const messageId = messages[messages.length - 1]._id;

  if (!userMessage || !threadId || !messageId) {
    return new Response("Invalid request", { status: 400 });
  }

  // Fetch user settings to get defaultModel, with fallback to request-provided model
  const userSettings = await convex.query(api.userFunctions.fetchUserSettings);
  const userModel =
    userSettings?.defaultModel ?? (model as DefaultModel | undefined);

  // Map user's defaultModel (or request-provided model) to OpenRouter format, with fallback
  const modelName =
    userModel != null ? mapModelToOpenRouter(userModel) : FALLBACK_MODELS[0]; // fallback if settings not found

  const systemMessages = await convertToModelMessages(messages);

  const toolFunctions = secondTool(convex, threadId, messageId);

  const stream = streamText({
    model: openRouter(modelName),
    system: "You are a helpful assistant that can answer questions.",
    messages: systemMessages,
    stopWhen: stepCountIs(10),
    tools: {
      firecrawl: toolFunctions.firecrawlTool,
    },
    onFinish: async (response) => {
      await Promise.all([
        convex.mutation(api.threadMessages.mutations.addThreadMessage, {
          threadId: threadId,
          role: "user",
          content: userMessage,
        }),
        convex.mutation(api.threadMessages.mutations.addThreadMessage, {
          threadId: threadId,
          role: "assistant",
          content: response.text as string,
        }),
      ]);
    },
  });

  return stream.toUIMessageStreamResponse();
}
