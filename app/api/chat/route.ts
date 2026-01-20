import {
  convertToModelMessages,
  stepCountIs,
  Experimental_Agent as Agent,
  LanguageModel,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { FALLBACK_MODELS, OpenRouterModels } from "@/convex/lib/modelMapping";
import { baseTools } from "@/lib/tools/weather";

// TODO: Need to refactor this to take in models and tools
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
    model = body.model as OpenRouterModels;
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

  if (!lastMessage.id) {
    return new Response("last message must have an id", { status: 400 });
  }

  const userMessage = lastMessage.parts[0].text;
  const messageId = lastMessage.id;

  if (!threadId) {
    return new Response("threadId is required", { status: 400 });
  }

  // Persist user message immediately before starting the stream
  try {
    await convex.mutation(api.uiMessages.mutation.addUIMessage, {
      threadId,
      id: messageId,
      role: "user",
      parts: [
        {
          type: "text",
          text: userMessage,
        },
      ],
    });
  } catch (error) {
    return new Response("Error adding user message", { status: 500 });
  }

  const systemMessages = convertToModelMessages(messages);

  const response = createUIMessageStreamResponse({
    status: 200,
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        const baseToolFunctions = baseTools({ writer });

        const agent = new Agent({
          model: openRouter(model, {
            extraBody: { models: FALLBACK_MODELS },
          }) as LanguageModel,
          system:
            "You are a helpful assistant that can answer questions." +
            "You can use the weather tool to get the weather for a given location." +
            "Include sources when providing information." +
            "Everything you return must be formatted in markdown.",
          stopWhen: stepCountIs(10),
          tools: { weather: baseToolFunctions.weatherTool },
        });

        const stream = agent.stream({ messages: systemMessages });

        writer.merge(
          stream.toUIMessageStream({
            onFinish: async ({ messages }) => {
              if (!messages || messages.length === 0) {
                writer.write({
                  type: "error",
                  errorText: "No messages returned from agent",
                });
                console.error("No messages returned from agent");
                return;
              }
              const lastMessage = messages[messages.length - 1];
              console.log("Last message", lastMessage);

              try {
                await convex.mutation(api.uiMessages.mutation.addUIMessage, {
                  threadId,
                  id: lastMessage.id,
                  role: lastMessage.role,
                  parts: lastMessage.parts,
                  metadata: lastMessage.metadata,
                });
              } catch (error) {
                console.error("Error adding UI message", error);
                writer.write({
                  type: "error",
                  errorText: "Error adding UI message",
                });
              }
            },
          }),
        );
      },
    }),
  });

  return response;
}
