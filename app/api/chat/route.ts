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

  let messages, threadId, model;
  try {
    const body = await request.json();
    messages = body.messages;
    threadId = body.threadId;
    model = body.model;
  } catch (error) {
    return new Response("Invalid JSON in request body", { status: 400 });
  }

  // Validate messages is an array with length > 0
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages must be a non-empty array", { status: 400 });
  }

  // Get the last message and validate its structure
  const lastMessage = messages[messages.length - 1];

  if (
    !lastMessage.parts ||
    !Array.isArray(lastMessage.parts) ||
    lastMessage.parts.length === 0
  ) {
    return new Response("last message must have a non-empty parts array", {
      status: 400,
    });
  }

  if (typeof lastMessage.parts[0].text !== "string") {
    return new Response("last message parts[0].text must be a string", {
      status: 400,
    });
  }

  if (!lastMessage._id) {
    return new Response("last message must have an _id", { status: 400 });
  }

  const userMessage = lastMessage.parts[0].text;
  const messageId = lastMessage._id;

  if (!threadId) {
    return new Response("threadId is required", { status: 400 });
  }

  // Persist user message immediately before starting the stream
  await convex.mutation(api.threadMessages.mutations.addThreadMessage, {
    threadId,
    role: "user",
    content: userMessage,
  });

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
      // Persist assistant message sequentially after ensuring response.text is defined
      const assistantContent = response.text ?? "";
      try {
        await convex.mutation(api.threadMessages.mutations.addThreadMessage, {
          threadId,
          role: "assistant",
          content: assistantContent,
        });
      } catch (error) {
        // Handle persistence failures gracefully
        console.error("Failed to persist assistant message:", error);
      }
    },
  });

  return stream.toUIMessageStreamResponse();
}
