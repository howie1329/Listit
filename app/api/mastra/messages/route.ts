import { mastra } from "@/app/mastra";
import { toAISdkV5Messages } from "@mastra/ai-sdk/ui";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");
  const userId = searchParams.get("userId");

  if (!threadId) {
    return NextResponse.json({ error: "threadId required" }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    const storage = mastra.getStorage();
    const memoryStore = await storage?.getStore("memory");

    if (!memoryStore) {
      return NextResponse.json(
        { error: "Memory store not available" },
        { status: 500 },
      );
    }

    // Verify thread ownership by loading the thread and checking resourceId
    const thread = await memoryStore.getThreadById({ threadId });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Verify the thread belongs to the user (resourceId === userId)
    if (thread.resourceId !== userId) {
      return NextResponse.json(
        { error: "Not authorized to access this thread" },
        { status: 403 },
      );
    }

    // Load messages for this thread
    const result = await memoryStore.listMessages({
      threadId,
      page: 0,
      perPage: 100,
    });

    // Convert to AI SDK format
    const uiMessages = toAISdkV5Messages(result?.messages ?? []);

    return NextResponse.json({ messages: uiMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}
