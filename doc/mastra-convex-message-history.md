# Mastra Message History with Convex

This document explains how Mastra's message history feature integrates with Convex for persisting chat conversations.

## Overview

Your codebase has **two approaches** for handling chat messages:

1. **Mastra's Built-in Memory** (via `@mastra/convex`) - Automatic message persistence
2. **Custom Implementation** (via `uiMessages` table) - Manual message persistence

Both can work with Convex, but they use different mechanisms.

---

## Approach 1: Mastra's Built-in Memory (Recommended)

This approach uses Mastra's memory system with `@mastra/convex` storage adapter. Messages are automatically saved to Mastra's tables (`mastra_threads`, `mastra_messages`).

### Setup Already in Place

Your schema already includes the Mastra tables:

```typescript
// convex/schema.ts
import {
  mastraThreadsTable,
  mastraMessagesTable,
  // ... other mastra tables
} from "@mastra/convex/schema";

export default defineSchema({
  mastra_threads: mastraThreadsTable,
  mastra_messages: mastraMessagesTable,
  // ...
});
```

And the storage handler:

```typescript
// convex/mastra/storage.ts
import { mastraStorage } from "@mastra/convex/server";
export const handle = mastraStorage;
```

### How It Works

Looking at your `/api/mastra/route.ts`:

```typescript
import { handleChatStream } from "@mastra/ai-sdk";
import { mastra } from "@/app/mastra";

export async function POST(request: Request) {
  const params = await request.json();
  
  const stream = await handleChatStream({
    mastra,
    agentId: "main-agent",
    params: {
      // This is the key configuration for message history
      memory: {
        resource: params.userId,    // Groups threads by user
        thread: params.threadId,    // The conversation thread ID
        options: {
          lastMessages: 10,         // How many messages to include in context
          generateTitle: true,      // Auto-generate thread title
        },
      },
      threadId: params.threadId,
      ...params,
    },
  });

  return createUIMessageStreamResponse({ stream });
}
```

### Key Memory Parameters

| Parameter | Description |
|-----------|-------------|
| `memory.resource` | A unique identifier for the user/resource (e.g., userId). This groups all threads for a user. |
| `memory.thread` | The thread/conversation ID. Messages are organized by thread. |
| `memory.options.lastMessages` | Number of previous messages to include in the AI context (default: 40). |
| `memory.options.generateTitle` | If true, Mastra auto-generates a title for new threads. |

### How Messages Are Saved

When you use `handleChatStream` with the `memory` config:

1. **User message**: Mastra automatically saves the incoming message to `mastra_messages`
2. **Assistant response**: Mastra automatically saves the AI response to `mastra_messages`
3. **Thread creation**: If the thread doesn't exist, it's created in `mastra_threads`

The Mastra instance uses `ConvexStore` which handles all persistence:

```typescript
// app/mastra/index.ts
import { ConvexStore } from "@mastra/convex";

export const mastra = new Mastra({
  // ...
  storage: new ConvexStore({
    id: "convex-storage",
    deploymentUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
    adminAuthToken: process.env.CONVEX_ADMIN_KEY!,
    storageFunction: "mastra/storage:handle",  // Points to convex/mastra/storage.ts
  }),
});
```

### Reading Messages from Mastra Tables

To retrieve messages stored by Mastra, you need to query the `mastra_messages` table:

```typescript
// Example: convex/mastra/queries.ts
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getThreadMessages = query({
  args: {
    threadId: v.string(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("mastra_messages")
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .collect();
    
    return messages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  },
});

export const getThreads = query({
  args: {
    resourceId: v.string(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const threads = await ctx.db
      .query("mastra_threads")
      .filter((q) => q.eq(q.field("resourceId"), args.resourceId))
      .collect();
    
    return threads;
  },
});
```

---

## Approach 2: Manual Message Persistence (Current `/api/chat` Route)

Your current `/api/chat/route.ts` manually persists messages to the `uiMessages` table. This gives you full control but requires more code.

### How It Works

```typescript
// app/api/chat/route.ts

// 1. Save user message before streaming
await convex.mutation(api.uiMessages.mutation.addUIMessage, {
  threadId,
  id: messageId,
  role: "user",
  parts: [{ type: "text", text: userMessage }],
});

// 2. Create the AI agent and stream
const agent = new Agent({
  model: openRouter.chat(model),
  // ...
});

const stream = agent.stream({ messages: systemMessages });

// 3. Save assistant message after completion
writer.merge(
  stream.toUIMessageStream({
    onFinish: async ({ messages }) => {
      const lastMessage = messages[messages.length - 1];
      await convex.mutation(api.uiMessages.mutation.addUIMessage, {
        threadId,
        id: lastMessage.id,
        role: lastMessage.role,
        parts: [...lastMessage.parts, ...customToolCallCapture],
      });
    },
  }),
);
```

---

## Comparison: Which Approach to Use?

| Feature | Mastra Memory | Manual Persistence |
|---------|---------------|-------------------|
| Automatic message saving | ✅ Yes | ❌ No (you write the code) |
| Works with Mastra agents | ✅ Native | ⚠️ Works but no auto-context |
| Custom message schema | ❌ Uses Mastra schema | ✅ Full control |
| Thread title generation | ✅ Built-in | ❌ Manual |
| Context window management | ✅ Built-in (`lastMessages`) | ❌ Manual |
| Semantic recall | ✅ Configurable | ❌ Not available |
| Real-time Convex reactivity | ✅ Yes (query the tables) | ✅ Yes |

---

## Migration: Unifying Your Implementation

Currently you have **both** approaches in parallel:
- `/api/mastra/route.ts` - Uses Mastra memory
- `/api/chat/route.ts` - Uses manual `uiMessages` persistence

### Option A: Use Mastra Memory Everywhere

Update `/api/chat/route.ts` to use `handleChatStream`:

```typescript
import { handleChatStream } from "@mastra/ai-sdk";
import { mastra } from "@/app/mastra";

export async function POST(request: Request) {
  const { messages, threadId, userId, model } = await request.json();
  
  const stream = await handleChatStream({
    mastra,
    agentId: "main-agent",
    params: {
      messages,
      memory: {
        resource: userId,
        thread: threadId,
        options: {
          lastMessages: 10,
          generateTitle: true,
        },
      },
      model, // You'd need to configure this in the agent or pass differently
    },
  });

  return createUIMessageStreamResponse({ stream });
}
```

Then update the frontend to query `mastra_messages` instead of `uiMessages`.

### Option B: Keep Manual Control

If you need custom message structure (like your rich `uiMessages` parts schema), continue with manual persistence but ensure you:

1. Save user messages before streaming
2. Save assistant messages in `onFinish`
3. Handle tool calls and intermediate states

---

## Frontend Integration

For **Mastra memory** approach, update your queries to read from Mastra tables:

```tsx
// In your chat page
const messages = useQuery(api.mastra.queries.getThreadMessages, 
  selectedThread ? { threadId: selectedThread } : "skip"
);

const threads = useQuery(api.mastra.queries.getThreads,
  userId ? { resourceId: userId } : "skip"
);
```

---

## Thread ID Considerations

Mastra's thread IDs are **strings**, not Convex document IDs. When using Mastra memory:

```typescript
// Creating a new thread with Mastra
const threadId = crypto.randomUUID(); // or any unique string

// Pass to API
await sendMessage({ text: message }, {
  body: {
    threadId,      // String ID, not Id<"thread">
    userId,        // Your user identifier
    // ...
  }
});
```

If you want to keep your existing `thread` table synchronized with Mastra, you can:
1. Create a record in your `thread` table
2. Use the Convex document ID as the Mastra thread ID

---

## Summary

1. **Mastra handles message history automatically** when you use `handleChatStream` with the `memory` configuration
2. **Messages are stored** in `mastra_threads` and `mastra_messages` tables via the `ConvexStore` adapter
3. **Your storage is already configured** in `convex/mastra/storage.ts`
4. **To read messages**, query the `mastra_messages` table filtering by `threadId`
5. **The key parameters** are `memory.resource` (user ID) and `memory.thread` (conversation ID)

The `/api/mastra/route.ts` endpoint in your codebase is the correct pattern for using Mastra's message history with Convex!
