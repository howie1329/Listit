import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { firecrawlTool, secondTool } from "@/convex/ai/tools/firecrawlAgent";

export async function POST(request: Request) {
  const openRouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_AI_KEY,
  });

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  const { messages, threadId } = await request.json();

  if (!messages || messages.length === 0) {
    return new Response("No messages provided", { status: 400 });
  }

  const userMessage = messages[messages.length - 1].parts[0].text;
  const messageId = messages[messages.length - 1]._id;

  if (!userMessage || !threadId || !messageId) {
    return new Response("Invalid request", { status: 400 });
  }

  const systemMessages = await convertToModelMessages(messages);

  const toolFunctions = secondTool(convex, threadId, messageId);

  const stream = streamText({
    model: openRouter("gpt-4o"),
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
