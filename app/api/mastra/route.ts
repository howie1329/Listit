import { handleChatStream } from "@mastra/ai-sdk";
import { mastra } from "@/app/mastra";
import { createUIMessageStreamResponse } from "ai";

export async function POST(request: Request) {
  const params = await request.json();
  const stream = await handleChatStream({
    mastra,
    agentId: "weather-agent",
    params: {
      ...params,
    },
  });

  return createUIMessageStreamResponse({ stream });
}
