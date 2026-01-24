import {
  convertToModelMessages,
  stepCountIs,
  ToolLoopAgent as Agent,
  LanguageModel,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { FALLBACK_MODELS, OpenRouterModels } from "@/convex/lib/modelMapping";
import { baseTools } from "@/lib/tools/weather";

export type CustomToolCallCapturePart = {
  type: string;
  id?: string;
  data: unknown;
};

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

  const systemMessages = await convertToModelMessages(messages);

  const response = createUIMessageStreamResponse({
    status: 200,
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        const customToolCallCapture: CustomToolCallCapturePart[] = [];
        const baseToolFunctions = baseTools({ writer, customToolCallCapture });

        /* FIXME(mastra): Add a unique `id` parameter. See: https://mastra.ai/guides/migrations/upgrade-to-v1/mastra#required-id-parameter-for-all-mastra-primitives */
        const agent = new Agent({
          model: openRouter.chat(model, {
            extraBody: { models: FALLBACK_MODELS },
          }) as LanguageModel,
          instructions:
            `You are the main agent for this application. You are responsible for routing requests to the appropriate agent.
            You can use the searchWebTool to search the web for information.
            Only run the searchWebTool once.
            Use the information from the searchWebTool to help give the best possible response.
            Always give a response to the users question but be upfront about short commings of the information.
            Include sources when providing information if possible.
            In the format of [Source](url)
            Everything you return must be formatted in markdown.`,
          stopWhen: stepCountIs(10),
          tools: { weather: baseToolFunctions.weatherTool, searchWebTool: baseToolFunctions.searchWebTool },
        });

        const stream = await agent.stream({ messages: systemMessages });

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
                const combinedParts = [...lastMessage.parts, ...customToolCallCapture];
                await convex.mutation(api.uiMessages.mutation.addUIMessage, {
                  threadId,
                  id: lastMessage.id,
                  role: lastMessage.role,
                  parts: combinedParts as unknown as Array<{
                    type: string;
                    id?: string;
                    data: unknown;
                  }>,
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
