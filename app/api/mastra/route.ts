import { handleChatStream } from "@mastra/ai-sdk";
import { mastra } from "@/app/mastra";
import { createUIMessageStreamResponse } from "ai";

export async function POST(request: Request) {
  const params = await request.json();
  const stream = await handleChatStream({
    mastra,
    agentId: "main-agent",
    params: {
      memory: {
        resource: params.threadId,
        thread: params.threadId,
        options: {
          lastMessages: 10,
          generateTitle: true,
        },
      },
      threadId: params.threadId,
      ...params,
    },
  });

  return createUIMessageStreamResponse({ stream });
}
