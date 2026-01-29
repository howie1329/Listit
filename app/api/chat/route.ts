import {
  convertToModelMessages,
  stepCountIs,
  ToolLoopAgent as Agent,
  createUIMessageStream,
  createUIMessageStreamResponse,
  wrapLanguageModel,
} from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { createOpenRouter, LanguageModelV3 } from "@openrouter/ai-sdk-provider";
import { FALLBACK_MODELS, OpenRouterModels } from "@/convex/lib/modelMapping";
import { baseTools } from "@/lib/tools/weather";
import { devToolsMiddleware } from '@ai-sdk/devtools';

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

  let messages, threadId, model, userId
  try {
    const body = await request.json();
    messages = body.messages;
    threadId = body.threadId;
    userId = body.userId;
    model = body.model as OpenRouterModels;
  } catch (error) {
    return new Response("Invalid JSON in request body", { status: 400 });
  }

  if (!model) {
    return new Response("model is required", { status: 400 });
  }

  if (!userId) {
    return new Response("userId is required", { status: 400 });
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

  // Getting the working memory
  // Working memory is a shared memory of the user to be used between different chats and sessions
  let workingMemory = null;
  try {
    workingMemory = await convex.mutation(api.chatmemory.mutations.ensureChatMemory, {
      userId,
    });
    console.log("Working memory", workingMemory);
  } catch (error) {
    return new Response("Error getting working memory", { status: 500 });
  }

  const systemMessages = await convertToModelMessages(messages);

  const devModel = wrapLanguageModel({
    model: openRouter.chat(model, {
      reasoning: { enabled: true, effort: "medium" },
      extraBody: { models: FALLBACK_MODELS },
      parallelToolCalls: true,
      usage: { include: true },
    }) as LanguageModelV3,
    middleware: devToolsMiddleware()
  })

  const response = createUIMessageStreamResponse({
    status: 200,
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        const customToolCallCapture: CustomToolCallCapturePart[] = [];
        const baseToolFunctions = baseTools({ writer, customToolCallCapture });
        const agent = new Agent({
          model: devModel,
          instructions:
            `You are the main agent for this application. You are responsible for routing requests to the appropriate agent.
            ===============================================
            Working Memory:
            ${workingMemory ? JSON.stringify(workingMemory) : "No working memory found"}
            The working memory is a shared memory of the user to be used between different chats and sessions.
            Working Memory Guidelines:
            - Infomation you can update in the working memory is: Name, Age, Preferences, Location, Interests, Tendencies, Notes, Extra
            - When updating you can retain pervious values of the working memory by not passing a new value for that field, or passing the old value and a new value fo that field.
            - Example: If the working memory has a name of "John" and you want to update the name to "Jane Doe", you can pass the old value of "John" and a new value of " Doe".
            - Example: If the working memory has the note of "User is a software engineer" and you want to update the note to "User is a software engineer and likes to code", you can pass the old value of "User is a software engineer" and a new value of "User is a software engineer and likes to code".
            - You can also update any field by passing in a new value for that field. This will override the previous value for that field.
            - You can also remove value from a field by passing in an empty string for that field.
            - Extra is a JSON object that can be used to store any additional information that is not covered by the other fields.
            - Extra is optional and can be omitted if not needed.
            - If there is no working memory fill in the working memory with empty values for each of the fields.
            ===============================================
            Tool Guidelines:
            - You can use the weatherTool to get the weather for a given location.
            - You can use the basicWebSearchTool to search the web for information using tavily.
            - You can use the searchWebTool to search the web for information using firecrawl agents.
            - Only run the searchWebTool max once per message.
            - Only run the basicWebSearchTool max three times per message.
            - Use the information from the searchWebTool and/or basicWebSearchTool to help give the best possible response.
            - The basicWebSearchTool should always run first as it is the least expensive tool to run.
            - The searchWebTool should only run if the basicWebSearchTool does not return enough information or if the request is more complex.
            - The user can dictate what tool to run by using @basic for the basicWebSearchTool or @search for the searchWebTool.
            - You can use the workingMemoryTool to update the working memory.
            - The user can dictate to update the working memory by using @workingMemory to update the working memory.
            ===============================================
            Flow Guidelines:
            - Update the working memory if necessary before using any other tools.
            - Use the tools to help give the best possible response.
            - After using the tools, update the working memory if necessary.
            ===============================================
            Response Guidelines:
            - Always give a response to the users question but be upfront about short commings of the information.
            - Include sources when providing information if possible.
            - In the format of [Source](url)
            - Provide the url of the direct link to the source if possible.
            - Everything you return must be formatted in markdown.
            - Give concise responses but also be informative and friendly.
            - You are not only a assistant but also should be a friend and a helpful assistant.`,
          stopWhen: stepCountIs(10),
          tools: { weather: baseToolFunctions.weatherTool, searchWebTool: baseToolFunctions.searchWebTool, workingMemoryTool: baseToolFunctions.workingMemoryTool, basicWebSearchTool: baseToolFunctions.tavilySearchTool },
          experimental_context: { userId: userId }
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
