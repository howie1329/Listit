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

## Message Summary System

### Overview

The message summary system automatically and manually creates structured summaries of chat conversations to maintain context and improve AI response quality. It uses a sophisticated multi-model fallback system to ensure reliable summary generation.

### Key Features

#### Automatic Summarization

- **Triggers:** After 10 messages OR 2000 tokens since last summary
- **Background processing:** Runs without interrupting conversation
- **Cost-effective:** Uses free/cheap AI models with fallback options
- **Token reduction:** Reduces 2000 tokens to 200-400 token summaries (80-90% reduction)

#### Manual Summarization

- **Command:** Type `@summarize` in chat
- **On-demand:** Request summaries at any time
- **Immediate feedback:** Shows progress and results instantly

#### Structured Summary Format

```json
{
  "overview": "Brief 2-3 sentence overview",
  "keyPoints": ["Important fact 1", "Important fact 2"],
  "decisions": ["Decision made 1", "Decision made 2"],
  "actionItems": ["Action item with context"],
  "openQuestions": ["Unresolved question"],
  "toolResults": [
    {
      "toolName": "toolName",
      "summary": "What the tool did",
      "importance": "high|medium|low"
    }
  ]
}
```

### Database Schema

#### `threadSummaries` Table

```typescript
threadSummaries: defineTable({
  threadId: v.id("thread"),

  // Summary Content (Structured JSON)
  summary: v.object({
    overview: v.string(),           // Brief paragraph
    keyPoints: v.array(v.string()), // Important facts
    decisions: v.array(v.string()), // Decisions made
    actionItems: v.array(v.string()), // Action items with context
    openQuestions: v.array(v.string()), // Unresolved questions
    toolResults: v.array(v.object({
      toolName: v.string(),
      summary: v.string(),
      importance: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    })),
  }),

  // Message Range
  messageRange: v.object({
    fromMessageId: v.string(),      // First message ID in range
    toMessageId: v.string(),        // Last message ID in range
    messageCount: v.number(),       // Number of messages summarized
    fromIndex: v.number(),          // Start index in thread
    toIndex: v.number(),            // End index in thread
  }),

  // Token & Cost Tracking
  sourceTokenCount: v.number(),     // Tokens in source messages
  summaryTokenCount: v.number(),    // Tokens in generated summary
  costUsd: v.optional(v.number()),  // Cost in USD
  modelUsed: v.string(),            // Which model generated summary

  // Metadata
  triggerType: v.union(
    v.literal("auto"),              // Auto-triggered
    v.literal("manual")             // User-triggered via @summarize
  ),
  status: v.union(
    v.literal("generating"),        // Currently generating
    v.literal("completed"),         // Successfully completed
    v.literal("failed"),            // Failed even with fallbacks
    v.literal("partial")            // Completed with errors
  ),

  // Timestamps
  createdAt: v.string(),
  updatedAt: v.string(),

  // Error tracking (for failed/partial)
  errorInfo: v.optional(v.object({
    message: v.string(),
    fallbackAttempts: v.number(),
    lastAttemptModel: v.string(),
  })),
})
.index("by_threadId", ["threadId"])
.index("by_threadId_created", ["threadId", "createdAt"]),
```

#### `thread` Table Updates

```typescript
thread: defineTable({
  // ... existing fields

  // Summary tracking (for quick checks)
  summaryCount: v.optional(v.number()), // Number of summaries
  lastSummaryAt: v.optional(v.string()), // Timestamp of last summary
  lastSummaryId: v.optional(v.id("threadSummaries")), // Reference to latest

  // Auto-trigger tracking
  messagesSinceLastSummary: v.optional(v.number()), // Counter for auto-trigger
  tokensSinceLastSummary: v.optional(v.number()), // Token counter
});
```

### Backend Implementation

#### 1. Queries (`convex/threadSummaries/queries.ts`)

```typescript
// Get all summaries for a thread (newest first)
export const getThreadSummaries = query({ ... });

// Get latest 2 summaries for context injection
export const getLatestSummariesForContext = query({ ... });

// Get summary by ID with full details
export const getSummaryById = query({ ... });

// Check if summarization is in progress
export const isSummarizationInProgress = query({ ... });
```

#### 2. Mutations (`convex/threadSummaries/mutations.ts`)

```typescript
// Create new summary (sets status to "generating")
export const createSummary = mutation({ ... });

// Update summary after generation
export const completeSummary = mutation({ ... });

// Mark summary as failed
export const failSummary = mutation({ ... });

// Update thread counters for auto-trigger
export const updateThreadCounters = mutation({ ... });

// Manual trigger (for @summarize command)
export const manualSummarize = mutation({ ... });
```

#### 3. Actions (`convex/threadSummaries/actions.ts`)

```typescript
// Generate summary using AI (with fallback models)
export const generateSummary = action({ ... });
```

### Frontend Components

#### 1. Summary Dialog (`components/features/chat/SummaryDialog.tsx`)

```typescript
export function SummaryDialog({ threadId, hasSummary }: SummaryDialogProps) {
  // UI showing latest summary with overview, key points, decisions, action items
  // Cost and token tracking display
  // Previous summary snapshot
  // Manual "Summarize Now" button
}
```

#### 2. Chat Integration (`app/(app)/chat/page.tsx`)

```typescript
// Add imports
import { SummaryDialog } from "@/components/features/chat/SummaryDialog";

// Add to the header section
div className="flex items-center justify-between">
  <h1 className="text-center">Chat</h1>
  {selectedThread && (
    <SummaryDialog
      threadId={selectedThread}
      hasSummary={sortedThreads?.find(t => t._id === selectedThread)?.summaryCount > 0}
    />
  )}
</div>
```

#### 3. Command Detection (`components/features/mastra/ChatBaseInput.tsx`)

```typescript
// Add to detected commands
const detectedCommands = useMemo(() => {
  const commands = [];
  const text = input.toLowerCase();

  // ... existing commands

  if (text.includes("@summarize")) {
    commands.push({ type: "@summarize", index: text.indexOf("@summarize") });
  }

  return commands.sort((a, b) => a.index - b.index);
}, [input]);
```

### API Route Modifications (`app/api/chat/route.ts`)

#### 1. Summary Context Injection

```typescript
// Add imports
import {
  estimateTokenCount,
  getMessagesWithSummaries,
} from "@/lib/chat/summary-utils";

// Modify the POST handler to include summaries
export async function POST(request: Request) {
  // ... existing setup

  // Get messages for context (with summaries)
  const { recentMessages, summaries, totalTokens } =
    await getMessagesWithSummaries(
      convex,
      threadId,
      4, // min messages
      10, // max messages
    );

  // Build system prompt with summaries
  const summaryContext =
    summaries.length > 0
      ? `## Previous Conversation Context\n\n${summaries
          .map(
            (s, i) =>
              `### Summary ${i + 1} (${new Date(s.createdAt).toLocaleDateString()}):\n${s.summary.overview}\n\nKey points: ${s.summary.keyPoints.join(", ")}`,
          )
          .join("\n\n")}\n\n`
      : "";

  const instructions = `
    You are the main agent for this application...
    
    ${summaryContext}
    
    ## Recent Messages (Last ${recentMessages.length}):
    ${recentMessages.map((m) => `${m.role}: ${m.content}`).join("\n\n")}
    
    ===============================================
    Working Memory:
    ${workingMemory ? JSON.stringify(workingMemory) : "No working memory found"}
    ...
  `;

  // Check if we should auto-trigger summarization
  const shouldSummarize = await checkAutoSummarizeTrigger(
    convex,
    threadId,
    recentMessages,
    summaries,
  );

  if (shouldSummarize.shouldTrigger) {
    // Trigger background summarization
    await triggerBackgroundSummarization(
      convex,
      threadId,
      shouldSummarize.messageRange,
    );
  }

  // ... rest of existing code
}
```

#### 2. Summary Trigger Logic

```typescript
async function checkAutoSummarizeTrigger(
  convex: ConvexHttpClient,
  threadId: string,
  recentMessages: any[],
  existingSummaries: any[],
) {
  // Get thread info
  const thread = await convex.query(api.thread.queries.getSingleThread, {
    threadId,
  });

  const messagesSinceLastSummary = thread?.messagesSinceLastSummary || 0;
  const tokensSinceLastSummary = thread?.tokensSinceLastSummary || 0;

  // Calculate tokens in recent messages (excluding summaries)
  const recentTokens = recentMessages.reduce((acc, m) => {
    const text = m.parts
      .filter((p: any) => p.type === "text" || p.type.startsWith("tool-"))
      .map((p: any) => p.text || JSON.stringify(p.output || p.input))
      .join(" ");
    return acc + estimateTokenCount(text);
  }, 0);

  const totalMessages = messagesSinceLastSummary + recentMessages.length;
  const totalTokens = tokensSinceLastSummary + recentTokens;

  // Check thresholds
  const messageThreshold = 10;
  const tokenThreshold = 2000;

  if (totalMessages >= messageThreshold || totalTokens >= tokenThreshold) {
    return {
      shouldTrigger: true,
      messageRange: {
        fromIndex:
          existingSummaries.length > 0
            ? existingSummaries[0].messageRange.toIndex + 1
            : 0,
        toIndex: totalMessages - 1,
        messageCount: totalMessages,
      },
    };
  }

  // Update counters
  await convex.mutation(api.threadSummaries.mutations.updateThreadCounters, {
    threadId: threadId as any,
    messageCount: recentMessages.length,
    tokenCount: recentTokens,
  });

  return { shouldTrigger: false };
}

async function triggerBackgroundSummarization(
  convex: ConvexHttpClient,
  threadId: string,
  messageRange: any,
) {
  // Get the actual message IDs
  const messages = await convex.query(api.uiMessages.queries.getUIMessages, {
    threadId,
  });
  const messagesToSummarize = messages.slice(
    messageRange.fromIndex,
    messageRange.toIndex + 1,
  );

  if (messagesToSummarize.length < 4) return;

  // Create summary record
  const summaryId = await convex.mutation(
    api.threadSummaries.mutations.createSummary,
    {
      threadId: threadId as any,
      triggerType: "auto",
      messageRange: {
        fromMessageId: messagesToSummarize[0].id,
        toMessageId: messagesToSummarize[messagesToSummarize.length - 1].id,
        messageCount: messagesToSummarize.length,
        fromIndex: messageRange.fromIndex,
        toIndex: messageRange.toIndex,
      },
      sourceTokenCount:
        messageRange.tokenCount ||
        estimateTokenCount(
          messagesToSummarize
            .map((m) =>
              m.parts
                .filter((p: any) => p.type === "text")
                .map((p: any) => p.text)
                .join(" "),
            )
            .join(" "),
        ),
    },
  );

  // Trigger background action
  await convex.action(api.threadSummaries.actions.generateSummary, {
    summaryId,
    threadId: threadId as any,
  });
}
```

### Utility Functions (`lib/chat/summary-utils.ts`)

```typescript
export async function getMessagesWithSummaries(
  convex: ConvexHttpClient,
  threadId: string,
  minMessages: number = 4,
  maxMessages: number = 10,
) {
  // Get all messages
  const allMessages = await convex.query(api.uiMessages.queries.getUIMessages, {
    threadId,
  });

  // Get latest 2 summaries
  const { summaries } = await convex.query(
    api.threadSummaries.queries.getLatestSummariesForContext,
    { threadId },
  );

  // Determine message range to include
  let startIndex = 0;
  if (summaries.length > 0) {
    const lastSummary = summaries[0];
    startIndex = lastSummary.messageRange.toIndex + 1;
  }

  // Calculate how many messages to include
  const messagesAfterSummary = allMessages.slice(startIndex);
  const messagesToInclude = Math.max(
    minMessages,
    Math.min(maxMessages, messagesAfterSummary.length),
  );

  // Get the recent messages
  const recentMessages = allMessages.slice(-messagesToInclude);

  // Calculate total tokens
  const totalTokens = recentMessages.reduce((acc, m) => {
    const text = m.parts
      .filter((p: any) => p.type === "text" || p.type.startsWith("tool-"))
      .map((p: any) => p.text || JSON.stringify(p.output || p.input))
      .join(" ");
    return acc + estimateTokenCount(text);
  }, 0);

  return {
    recentMessages,
    summaries,
    totalTokens,
  };
}

export function estimateTokenCount(text: string): number {
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  return Math.ceil(wordCount * 1.3);
}
```

### Multi-Model Fallback System

The system uses a fallback chain to ensure reliable summary generation:

1. **Trinity** (`arcee-ai/trinity-large-preview:free`) - Primary model
2. **DeepSeek** (`deepseek/deepseek-r1-0528:free`) - Secondary model
3. **Mistral** (`mistralai/ministral-8b`) - Final fallback

This ensures summaries are always generated, even if higher-priority models fail.

### Cost Tracking

The system tracks:

- **Source tokens:** Tokens in the original conversation
- **Summary tokens:** Tokens in the generated summary
- **Cost:** Estimated cost in USD (using OpenRouter pricing)
- **Model:** Which model was used for generation

### Integration with AI Responses

Summaries are automatically included in the AI's context, helping maintain conversation continuity without processing all messages. The system includes:

- Latest 2 summaries in conversation context
- Recent messages (4-10) for immediate context
- Working memory for cross-session continuity

---

## Related Documentation

- `message-summary-user-guide.md` - User-facing documentation for message summary features
- `conversation-summarization.md` - Detailed implementation plan and technical specifications

---

**Questions?** Check the codebase or reach out to the development team.
