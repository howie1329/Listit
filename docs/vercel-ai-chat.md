# Vercel AI SDK Chat System Documentation

**Last Updated:** January 30, 2026  
**Technology:** Vercel AI SDK v6 + ToolLoopAgent + Convex + Next.js  
**Location:** `/app/(app)/chat/` and `/app/api/chat/`

## Recent Updates (January 30, 2026)

- ✅ **Modern Thread UI**: Redesigned thread list with message previews, relative timestamps, and clean minimal design
- ✅ **Auto-Generated Titles**: Thread titles automatically generated from first user message (40 char limit)
- ✅ **Message Previews**: Thread list shows last assistant message preview (60 chars)
- ✅ **Enhanced Thread Management**: Delete functionality with confirmation dialog
- ✅ **Improved Visual Design**: Removed borders, smooth transitions, better spacing

---

## Overview

This document provides a comprehensive reference for the Vercel AI SDK-based chat system in Listit. The system uses a sophisticated dual-agent architecture with working memory, tool execution, and multi-model support via OpenRouter.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHAT ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   Frontend   │───▶│   API Route  │───▶│     AI SDK   │              │
│  │  (Chat Page) │    │ (/api/chat)  │    │  (Backend)   │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│         │                   │                   │                       │
│         ▼                   ▼                   ▼                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │  UI State    │    │   Message    │    │  ToolLoopAgent│             │
│  │  (useChat)   │    │   Stream     │    │  + LLM Calls │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│                                                         │               │
│                                                         ▼               │
│                                              ┌──────────────┐          │
│                                              │    Tools     │          │
│                                              │  (Weather,    │          │
│                                              │   Search,     │          │
│                                              │   Memory)     │          │
│                                              └──────────────┘          │
│                                                         │               │
│                                                         ▼               │
│                                              ┌──────────────┐          │
│                                              │   Convex DB  │          │
│                                              │ (Persistence) │          │
│                                              └──────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## File Structure

```
app/
├── (app)/
│   └── chat/
│       └── page.tsx              # Main chat interface
├── api/
│   └── chat/
│       └── route.ts              # API route with ToolLoopAgent
lib/
└── tools/
    └── weather.tsx               # Tool definitions (weather, search, memory)
convex/
├── schema.ts                     # Database schema (uiMessages, thread, workingMemory)
├── uiMessages/
│   ├── mutation.ts               # CRUD operations for messages
│   └── queries.ts                # Fetch messages by thread
├── thread/
│   ├── queries.ts                # List user threads
│   └── mutations.ts              # Create/delete threads
└── chatmemory/
    └── mutations.ts              # Working memory operations
components/
├── ai-elements/                  # 30+ reusable AI UI components
│   ├── conversation.tsx          # Scroll container
│   ├── message.tsx               # Message display
│   ├── reasoning.tsx             # Reasoning/thinking display
│   ├── tool.tsx                  # Tool execution UI
│   ├── prompt-input.tsx          # Chat input
│   └── model-selector.tsx        # Model picker
└── features/
    ├── chat/
    │   └── ThreadListItem.tsx    # Modern thread list item with preview
    └── mastra/
        └── ChatBaseInput.tsx     # Combined input with model selector
```

---

## Core Components

### 1. Chat Page (`/app/(app)/chat/page.tsx`)

**Purpose:** Main chat interface with thread management

**Key Features:**

- Thread sidebar (create, select, delete)
- Real-time message streaming
- Model selection
- Command detection (@basic, @search, @workingMemory)

**Code Pattern:**

```typescript
const {
  messages: chatMessages,
  sendMessage,
  status,
  setMessages,
} = useChat({
  transport: new DefaultChatTransport({
    api: "/api/chat",
  }),
  messages: [],
  experimental_throttle: 100,
});
```

### 2. API Route (`/app/api/chat/route.ts`)

**Purpose:** Backend handler using ToolLoopAgent

**Key Components:**

- OpenRouter model configuration with reasoning
- Working memory retrieval
- Tool execution with streaming
- Message persistence to Convex

**Agent Configuration:**

```typescript
const agent = new Agent({
  model: devModel, // Wrapped with devToolsMiddleware
  instructions: `/* System prompt with guidelines */`,
  stopWhen: stepCountIs(10), // Limit tool loops
  tools: {
    weather: baseToolFunctions.weatherTool,
    searchWebTool: baseToolFunctions.searchWebTool,
    workingMemoryTool: baseToolFunctions.workingMemoryTool,
    basicWebSearchTool: baseToolFunctions.tavilySearchTool,
  },
  experimental_context: { userId: userId },
});
```

### 3. Tools (`/lib/tools/weather.tsx`)

**Available Tools:**

| Tool                 | Description                | Provider         | Usage                     |
| -------------------- | -------------------------- | ---------------- | ------------------------- |
| `weatherTool`        | Get weather for a location | Mock/Simulated   | Auto-detect or user query |
| `searchWebTool`      | Advanced web search        | Firecrawl agents | `@search` command         |
| `basicWebSearchTool` | Basic web search           | Tavily           | `@basic` command          |
| `workingMemoryTool`  | Update user working memory | Convex           | `@workingMemory` command  |

**Tool Structure:**

```typescript
export const baseTools = ({
  writer,
  customToolCallCapture,
}: {
  writer: UIMessageStreamWriter;
  customToolCallCapture: CustomToolCallCapturePart[];
}) => {
  return {
    toolName: tool({
      description: "Tool description",
      inputSchema: z.object({ /* validation */ }),
      outputSchema: z.object({ /* validation */ }),
      execute: async (input, { experimental_context: context }) => {
        // Tool logic with streaming updates
        writer.write({ type: "data-tool-name", id: toolId, data: {...} });
        return result;
      },
    }),
  };
};
```

---

## Database Schema

### UIMessage Table

**Purpose:** Persist chat messages compatible with Vercel AI SDK

```typescript
uiMessages: defineTable({
  threadId: v.id("thread"),
  id: v.string(),              // AI SDK message ID
  role: v.union(
    v.literal("system"),
    v.literal("user"),
    v.literal("assistant"),
  ),
  metadata: v.optional(v.any()),
  parts: v.array(/* Message parts: text, reasoning, tool, data, file */),
  updatedAt: v.string(),
}).index("by_threadId", ["threadId"]),
```

### Working Memory Table

**Purpose:** Cross-session user profile storage

```typescript
workingMemory: defineTable({
  userId: v.id("users"),
  name: v.optional(v.string()),
  age: v.optional(v.number()),
  preferences: v.optional(v.string()),
  location: v.optional(v.string()),
  interests: v.optional(v.string()),
  tendencies: v.optional(v.string()),
  notes: v.optional(v.string()),
  extra: v.optional(v.any()),
}).index("by_userId", ["userId"]),
```

### Thread Table

**Purpose:** Chat conversation grouping with auto-generated titles

```typescript
thread: defineTable({
  userId: v.id("users"),
  title: v.string(),              // Auto-generated from first message (40 chars max)
  streamingStatus: v.union(
    v.literal("idle"),
    v.literal("streaming"),
    v.literal("error"),
  ),
  updatedAt: v.string(),
}).index("by_userId", ["userId"]),
```

**Queries:**

| Query                       | Location                   | Description                                     |
| --------------------------- | -------------------------- | ----------------------------------------------- |
| `getUserThreads`            | `convex/thread/queries.ts` | Basic thread list                               |
| `getUserThreadsWithPreview` | `convex/thread/queries.ts` | Thread list with last assistant message preview |

**Mutations:**

| Mutation                      | Location                     | Description                    |
| ----------------------------- | ---------------------------- | ------------------------------ |
| `createThread`                | `convex/thread/mutations.ts` | Create thread (title optional) |
| `updateThreadTitle`           | `convex/thread/mutations.ts` | Update thread title            |
| `deleteThread`                | `convex/thread/mutations.ts` | Delete thread + all messages   |
| `updateThreadStreamingStatus` | `convex/thread/mutations.ts` | Update streaming state         |

**Auto-Title Generation:**

Thread titles are automatically generated from the first user message:

```typescript
// In /app/api/chat/route.ts
if (existingMessages.length === 1) {
  const generatedTitle =
    userMessage.length > 40 ? userMessage.slice(0, 40) + "..." : userMessage;

  await convex.mutation(api.thread.mutations.updateThreadTitle, {
    threadId,
    title: generatedTitle,
  });
}
```

---

## Supported Models (OpenRouter)

| Model                 | ID                                       | Provider | Free | Notes            |
| --------------------- | ---------------------------------------- | -------- | ---- | ---------------- |
| DeepSeek R1 0528      | `deepseek/deepseek-r1-0528:free`         | DeepSeek | ✅   | Strong reasoning |
| Llama 3.3 70B         | `meta-llama/llama-3.3-70b-instruct:free` | Meta     | ✅   | General purpose  |
| Mistral Ministral 8B  | `mistralai/ministral-8b`                 | Mistral  | ❌   | Efficient        |
| Trinity Large Preview | `arcee-ai/trinity-large-preview:free`    | Arcee    | ✅   | Experimental     |
| Kimi K2.5             | `moonshotai/kimi-k2.5`                   | Moonshot | ❌   | Long context     |
| Kimi K2               | `moonshotai/kimi-k2-0905`                | Moonshot | ❌   | Balanced         |
| GPT-5 Mini            | `openai/gpt-5-mini`                      | OpenAI   | ❌   | Fast responses   |
| GPT-5 Nano            | `openai/gpt-5-nano`                      | OpenAI   | ❌   | Lightest         |
| Grok 4.1 Fast         | `x-ai/grok-4.1-fast`                     | xAI      | ❌   | X integration    |

**Configuration:**

```typescript
const devModel = wrapLanguageModel({
  model: openRouter.chat(model, {
    reasoning: { enabled: true, effort: "medium" },
    extraBody: { models: FALLBACK_MODELS }, // Fallback models on failure
    parallelToolCalls: true,
    usage: { include: true },
  }) as LanguageModelV3,
  middleware: devToolsMiddleware(), // Dev debugging
});
```

---

## Special Commands

Users can trigger specific tools using commands in their messages:

| Command          | Tool                 | Description           |
| ---------------- | -------------------- | --------------------- |
| `@basic`         | `basicWebSearchTool` | Quick Tavily search   |
| `@search`        | `searchWebTool`      | Deep Firecrawl search |
| `@workingMemory` | `workingMemoryTool`  | Update user profile   |

**Command Detection (Frontend):**

```typescript
const detectedCommands = useMemo(() => {
  const commands = [];
  const text = input.toLowerCase();

  if (text.includes("@basic"))
    commands.push({ type: "@basic", index: text.indexOf("@basic") });
  if (text.includes("@search"))
    commands.push({ type: "@search", index: text.indexOf("@search") });
  if (text.includes("@workingmemory"))
    commands.push({
      type: "@workingMemory",
      index: text.indexOf("@workingmemory"),
    });

  return commands.sort((a, b) => a.index - b.index);
}, [input]);
```

---

## AI UI Components

### Conversation Components

**Conversation** - Scroll container that sticks to bottom

```typescript
<Conversation className="flex-1">
  <ConversationContent>
    {messages.map(...)}
  </ConversationContent>
  <ConversationScrollButton />
</Conversation>
```

### Message Components

**Message** - Individual message display

```typescript
<Message from={message.role}>
  <MessageContent>
    <MessageResponse>{part.text}</MessageResponse>
  </MessageContent>
</Message>
```

### Reasoning Components

**Reasoning** - Collapsible thinking/reasoning display

```typescript
<Reasoning defaultOpen={false}>
  <ReasoningTrigger />
  <ReasoningContent>{part.text}</ReasoningContent>
</Reasoning>
```

### Tool Components

**Tool** - Tool execution visualization

```typescript
<Tool>
  <ToolHeader title={toolName} type={part.type} state={part.state} />
  <ToolContent>
    <ToolInput input={part.input} />
    <ToolOutput output={part.output} errorText={part.errorText} />
  </ToolContent>
</Tool>
```

### Input Components

**PromptInput** - Chat input with submit handling

```typescript
<PromptInputProvider>
  <PromptInput globalDrop onSubmit={handleSubmit}>
    <PromptInputBody>
      <PromptInputTextarea value={input} onChange={...} />
    </PromptInputBody>
    <PromptInputFooter>
      <PromptInputTools>
        <ModelSelector>...</ModelSelector>
        <PromptInputSubmit disabled={status === "streaming"} />
      </PromptInputTools>
    </PromptInputFooter>
  </PromptInput>
</PromptInputProvider>
```

### Thread Components

**ThreadListItem** - Modern thread list item with message preview

```typescript
<ThreadListItem
  thread={{
    _id: threadId,
    title: "Thread Title",
    streamingStatus: "idle",
    updatedAt: "2026-01-30T...",
    lastMessagePreview: "Last assistant message...",
  }}
  isSelected={selectedThread === thread._id}
  onSelect={setSelectedThread}
  onDelete={handleDeleteThread}
/>
```

**Features:**

- **Modern Design**: Clean, borderless design with subtle hover states
- **Message Preview**: Shows last assistant message (60 chars max)
- **Relative Timestamps**: "just now", "5m ago", "2h ago", "3d ago"
- **Auto-Generated Titles**: Generated from first user message (40 chars max)
- **Streaming Indicator**: Animated pulse dot when `streamingStatus === "streaming"`
- **Delete Functionality**: Hover-revealed delete button with confirmation dialog
- **Keyboard Accessibility**: Full keyboard navigation support

**Visual Design:**

```typescript
// Container styling
"group relative flex flex-col gap-0.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150";
"hover:bg-muted/50";
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

// Selected state
"bg-primary/10 hover:bg-primary/10";

// Thread title
"text-sm font-medium leading-5 truncate";

// Message preview
"text-xs text-muted-foreground leading-4 truncate";
// "No messages yet" in italics when empty

// Timestamp
"text-xs text-muted-foreground/70";
```

---

## Data Flow

### Sending a Message

1. **Frontend:** User submits message via `PromptInput`
2. **Frontend:** `useChat.sendMessage()` sends to `/api/chat`
3. **API Route:** Validates request (userId, threadId, model, message)
4. **API Route:** Persists user message to Convex `uiMessages`
5. **API Route:** Retrieves working memory from Convex
6. **API Route:** Creates `ToolLoopAgent` with model + tools
7. **ToolLoopAgent:** Streams response with optional tool calls
8. **API Route:** Captures tool outputs via `customToolCallCapture`
9. **API Route:** Persists assistant message to Convex on finish
10. **Frontend:** Receives streamed response parts and renders them

### Message Part Types

```typescript
type MessagePart =
  | { type: "step-start" }
  | { type: "text"; text: string; state?: "streaming" | "done" }
  | {
      type: "reasoning";
      text: string;
      state?: "streaming" | "done";
      providerMetadata?: any;
    }
  | {
      type: `tool-${string}`;
      toolCallId: string;
      state:
        | "input-streaming"
        | "input-available"
        | "output-available"
        | "output-error";
      input: any;
      output?: any;
      errorText?: string;
    }
  | { type: `data-${string}`; id?: string; data: any }
  | { type: "source-url"; sourceId: string; url: string; title?: string }
  | {
      type: "source-document";
      sourceId: string;
      mediaType: string;
      title: string;
      filename?: string;
    }
  | { type: "file"; mediaType: string; filename?: string; url: string };
```

---

## Working Memory System

**Purpose:** Cross-session user profile that persists between chats

**Fields:**

- `name` - User's name
- `age` - User's age
- `preferences` - General preferences
- `location` - Location info
- `interests` - Topics of interest
- `tendencies` - Behavioral patterns
- `notes` - Additional notes
- `extra` - JSON object for custom data

**Agent Guidelines:**

```
Working Memory Guidelines:
- Update before using other tools if necessary
- Retain previous values by passing old + new values
- Override fields by passing new values only
- Remove values by passing empty strings
- Extra is optional JSON for custom data
```

**Usage:**

```typescript
// In tool execution
await convex.mutation(api.chatmemory.mutations.setChatMemory, {
  userId: passedContext.userId,
  name: name,
  // ... other fields
});
```

---

## Environment Variables

```bash
# Required
OPENROUTER_AI_KEY=              # OpenRouter API key
CONVEX_DEPLOYMENT=              # Convex deployment URL
CONVEX_ADMIN_KEY=               # For Mastra (if using both systems)

# Tool-specific
FIRECRAWL_API_KEY=              # Firecrawl for web search
TAVILY_API_KEY=                 # Tavily for basic search

# Development
NEXT_PUBLIC_CONVEX_URL=         # Convex client URL
```

---

## Usage Patterns

### Adding a New Tool

1. **Define tool in `/lib/tools/weather.tsx`:**

```typescript
newTool: tool({
  description: "Description for the agent",
  inputSchema: z.object({
    param: z.string().describe("Parameter description"),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ param }, { experimental_context: context }) => {
    // Implementation
    writer.write({
      type: "data-new-tool",
      id: toolId,
      data: { status: "running", param }
    });

    const result = await doSomething(param);

    writer.write({
      type: "data-new-tool",
      id: toolId,
      data: { status: "completed", result }
    });

    customToolCallCapture.push({
      type: "data-new-tool",
      id: toolId,
      data: { status: "completed", result }
    });

    return { result };
  },
}),
```

2. **Add to agent tools in `/app/api/chat/route.ts`:**

```typescript
tools: {
  // ... existing tools
  newTool: baseToolFunctions.newTool,
},
```

3. **Update agent instructions:**

```typescript
instructions: `
  ...
  - You can use the newTool to do X.
  ...
`,
```

4. **Create UI component in `/components/ai-elements/` (optional):**

```typescript
// For custom data visualization
```

### Adding a New Model

1. **Update model list in `/components/features/mastra/ChatBaseInput.tsx`:**

```typescript
const models: ModelType[] = [
  // ... existing models
  {
    id: "new-model-id",
    displayName: "New Model Name",
    slug: "openrouter/new-model-id",
    provider: "provider-name",
    openrouterslug: "provider/model-id",
  },
];
```

2. **Update model mapping in `/convex/lib/modelMapping.ts` (if needed)**

### Customizing Agent Behavior

1. **Update system prompt in `/app/api/chat/route.ts`:**

```typescript
instructions: `
  You are the main agent for this application...

  [Add custom behavior guidelines here]

  Flow Guidelines:
  - [Custom flow rules]

  Response Guidelines:
  - [Custom response rules]
`,
```

2. **Adjust step limit:**

```typescript
stopWhen: stepCountIs(15),  // Increase/decrease tool loops
```

---

## Key Dependencies

```json
{
  "ai": "^6.x", // Vercel AI SDK core
  "@ai-sdk/react": "^6.x", // React hooks for chat
  "@openrouter/ai-sdk-provider": "^1.x", // OpenRouter provider
  "@ai-sdk/devtools": "^1.x", // Development debugging
  "convex": "^1.x", // Backend database
  "@mendable/firecrawl-js": "^1.x", // Web scraping
  "@tavily/core": "^0.x", // Search API
  "streamdown": "^1.x", // Markdown rendering
  "use-stick-to-bottom": "^1.x" // Auto-scroll behavior
}
```

---

## Troubleshooting

### Common Issues

**Issue:** Messages not persisting  
**Solution:** Check Convex connection and `uiMessages.mutation.addUIMessage` permissions

**Issue:** Tools not executing  
**Solution:** Verify tool API keys (Firecrawl, Tavily) in environment variables

**Issue:** Streaming stops unexpectedly  
**Solution:** Check `stopWhen: stepCountIs()` limit; increase if needed

**Issue:** Model not responding  
**Solution:** Verify OpenRouter API key and model availability

**Issue:** Working memory not updating  
**Solution:** Ensure `userId` is passed in `experimental_context` and tool context

### Debug Mode

Enable DevTools middleware for debugging:

```typescript
const devModel = wrapLanguageModel({
  model: openRouter.chat(...),
  middleware: devToolsMiddleware()  // Add this
});
```

---

## Future Enhancements

### Implemented ✅

- [x] **Modern thread UI with message previews** (Jan 30, 2026)
- [x] **Auto-generated thread titles** from first message (Jan 30, 2026)
- [x] **Thread delete functionality** with confirmation (Jan 30, 2026)
- [x] **Relative timestamps** in thread list (Jan 30, 2026)
- [x] **Streaming indicators** for active conversations (Jan 30, 2026)

### Planned

- [ ] File upload support (images, documents)
- [ ] Voice input/output
- [ ] Multi-modal responses
- [ ] Agent delegation to specialized agents
- [ ] Message branching and editing
- [ ] Shared/public threads
- [ ] Message search within threads
- [ ] Custom tool marketplace
- [ ] Rate limiting per user
- [ ] Message streaming optimization
- [ ] Thread grouping by date (Today, Yesterday, Earlier)
- [ ] Thread search/filter functionality
- [ ] Bulk thread operations (multi-select delete)

---

## References

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [ToolLoopAgent API](https://sdk.vercel.ai/docs/reference/ai-sdk-core/tool-loop-agent)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Firecrawl Documentation](https://docs.firecrawl.dev)
- [Tavily Documentation](https://docs.tavily.com)

---

## Related Documentation

- `codebase-review.md` - Overall codebase architecture
- `mastra-chat.md` - Mastra framework chat system (alternative implementation)
- `convex-schema.md` - Database schema reference

---

**Questions?** Check the codebase or reach out to the development team.
