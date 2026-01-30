# Listit - Codebase Review & Recommendations

**Date:** January 30, 2026  
**Reviewer:** Senior Developer Review  
**Total LOC:** ~100,134 lines across ~16,367 files  
**Overall Grade:** B+ (Good foundation with areas needing attention)

---

## 🎯 Executive Summary

**Listit** is a sophisticated productivity application that combines AI-assisted task management with intelligent bookmark organization. Built with modern technologies (Next.js 16, Convex, Mastra AI), it demonstrates strong architectural decisions and excellent keyboard-driven UX. However, the codebase has critical gaps in testing, inconsistent error handling patterns, and opportunities for code deduplication.

**Key Metrics:**

- Modern tech stack implementation: ⭐⭐⭐⭐⭐
- Code organization: ⭐⭐⭐⭐
- Type safety: ⭐⭐⭐⭐⭐
- Test coverage: ⭐ (Critical gap)
- Error handling consistency: ⭐⭐
- Performance optimization: ⭐⭐⭐

---

## ✅ Strengths

### 1. **Modern Technology Stack**

- Next.js 16 with App Router and Server Components
- React 19 with latest hooks and patterns
- Convex for real-time sync and serverless backend
- Mastra AI framework for sophisticated agent orchestration
- Tailwind CSS v4 for utility-first styling
- TypeScript with full type safety

### 2. **Well-Organized Architecture**

```
Listit/
├── app/(app)/           # Authenticated routes with proper layout
├── components/          # Clear separation (ui/, features/, ai-elements/)
├── convex/             # Backend with schema, queries, mutations
├── hooks/              # Custom React hooks with proper context
├── providers/          # Clean provider composition
└── lib/                # Utilities and tools
```

### 3. **Excellent Keyboard UX**

Vim-style navigation throughout the app:

- Items: `j/k` navigate, `T/B` move focus, `X` complete, `A` archive
- Bookmarks: `j/k` navigate, `E` edit, `Shift+Delete` delete
- Global: `/` search, `Cmd+N` create, `Esc` clear

### 4. **Sophisticated AI Integration**

- Multi-agent system with working memory
- Tool integration (weather, web search via Tavily)
- Firecrawl for intelligent bookmark scraping
- Thread-based conversation management
- OpenRouter for multi-model AI access

### 5. **Real-Time Data Sync**

Convex provides instant updates across:

- Item management (create, update, delete)
- Bookmark collections
- Chat threads and messages
- User settings

---

## ⚠️ Critical Issues

### 1. **Zero Test Coverage** 🔴

**Status:** No test files found in the entire codebase

**Risk:**

- Regressions in production
- Difficult refactoring
- No confidence in deployments
- AI features especially vulnerable to breaking changes

**Impact:** HIGH  
**Effort to Fix:** 3-4 weeks

### 2. **Inconsistent Error Handling** 🔴

**Current State:** 44 console.log/error statements scattered throughout

**Examples Found:**

```typescript
// Pattern 1 - Console only (bad for users)
console.error("Failed to create item:", error);

// Pattern 2 - Toast only (bad for debugging)
toast.error("Failed to create item");

// Pattern 3 - Both (inconsistent)
catch (error) {
  console.error("Failed to create collection:", error);
  toast.error("Failed to create collection");
}
```

**Impact:** MEDIUM  
**Effort to Fix:** 1 week

### 3. **Severe Code Duplication** 🟡

**Problem:** Convex query return types duplicated 20+ times

**Example:**

```typescript
// Same object repeated in every query
returns: v.array(
  v.object({
    _id: v.id("bookmarks"),
    userId: v.id("users"),
    url: v.string(),
    title: v.string(),
    // ... 20+ fields repeated
    readingTime: v.optional(v.number()),
    searchText: v.string(),
  }),
);
```

**Impact:** MEDIUM  
**Effort to Fix:** 3 days

### 4. **Outstanding TODOs** 🟡

Found 3 TODO/FIXME comments:

- `app/api/chat/route.ts:22` - Refactor to accept models and tools
- `convex/ai/actions.ts:12` - Remove unused action
- `convex/ai/actions.ts:83` - FIXME for Mastra v1 upgrade

**Impact:** LOW  
**Effort to Fix:** 1 day

### 5. **No Error Boundaries** 🟡

Missing React error boundaries for crash resilience. If a component crashes, the entire app could fail.

**Impact:** MEDIUM  
**Effort to Fix:** 2 days

---

## 🔧 Detailed Recommendations

### 1. **Implement Comprehensive Testing Strategy** 🔴 Priority: Critical

#### Recommended Test Structure:

```
__tests__/
├── unit/
│   ├── hooks/
│   │   ├── use-keyboard-navigation.test.ts
│   │   └── use-bookmark-keyboard-navigation.test.ts
│   ├── lib/
│   │   ├── utils.test.ts
│   │   └── errors.test.ts
│   └── convex/
│       └── validators.test.ts
├── integration/
│   ├── items.test.ts
│   ├── bookmarks.test.ts
│   └── chat.test.ts
└── e2e/
    ├── auth.spec.ts
    ├── items.spec.ts
    └── bookmarks.spec.ts
```

#### Test Implementation Plan:

**Phase 1: Unit Tests (Week 1-2)**

```typescript
// Example: hooks/__tests__/use-keyboard-navigation.test.tsx
import { renderHook, act } from '@testing-library/react';
import { KeyboardNavigationProvider, useKeyboardNavigation } from '../use-keyboard-navigation';

describe('useKeyboardNavigation', () => {
  it('should select next item on ArrowDown', () => {
    const items = [/* mock items */];
    const { result } = renderHook(() => useKeyboardNavigation(), {
      wrapper: ({ children }) => (
        <KeyboardNavigationProvider initialItems={items}>
          {children}
        </KeyboardNavigationProvider>
      )
    });

    act(() => {
      // Simulate keydown
      result.current.selectNextItem();
    });

    expect(result.current.selectedItemId).toBe(items[1]._id);
  });
});
```

**Phase 2: Convex Integration Tests (Week 2-3)**

```typescript
// convex/__tests__/items.test.ts
import { convexTest } from "convex-test";

describe("items", () => {
  it("should create item with authentication", async () => {
    const t = convexTest();
    const userId = await t.mutation(api.auth.signIn, {
      email: "test@test.com",
    });

    const itemId = await t.mutation(
      api.items.mutations.createSingleItem,
      {
        title: "Test Item",
        description: "Description",
      },
      { userId },
    );

    expect(itemId).toBeDefined();
  });
});
```

**Phase 3: E2E Tests (Week 3-4)**

```typescript
// e2e/items.spec.ts
import { test, expect } from "@playwright/test";

test("user can create and manage items", async ({ page }) => {
  await page.goto("/item");
  await page.fill('[data-testid="search-input"]', "New Task");
  await page.keyboard.press("Enter");
  await expect(page.locator("text=New Task")).toBeVisible();
});
```

**Tools to Add:**

```json
// package.json additions
{
  "devDependencies": {
    "@testing-library/react": "^16.x",
    "@testing-library/jest-dom": "^6.x",
    "vitest": "^2.x",
    "@playwright/test": "^1.x",
    "convex-test": "^0.x"
  },
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:coverage": "vitest --coverage"
  }
}
```

---

### 2. **Standardize Error Handling** 🔴 Priority: High

#### Create Error Utility Layer:

```typescript
// lib/errors.ts
import { toast } from "sonner";

export type ErrorSeverity = "low" | "medium" | "high" | "critical";

export interface ErrorOptions {
  toast?: boolean;
  log?: boolean;
  severity?: ErrorSeverity;
  userMessage?: string;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public options: ErrorOptions = {},
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleError(error: unknown, options: ErrorOptions = {}): void {
  const {
    toast: showToast = true,
    log: shouldLog = true,
    severity = "medium",
    userMessage,
  } = options;

  // Log to console (remove in production build)
  if (shouldLog) {
    if (severity === "critical" || severity === "high") {
      console.error("[AppError]", error);
    } else {
      console.warn("[AppError]", error);
    }
  }

  // Show toast notification
  if (showToast) {
    const message = userMessage || getDefaultErrorMessage(error);
    toast.error(message);
  }

  // Send to error tracking service (Sentry, etc.)
  if (severity === "critical") {
    // reportToSentry(error);
  }
}

function getDefaultErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return "An unexpected error occurred. Please try again.";
  }
  return "Something went wrong";
}

// Convex-specific error wrapper
export function handleConvexError(error: unknown): never {
  if (error instanceof Error) {
    if (error.message.includes("User not found")) {
      throw new AppError("Please sign in to continue", "AUTH_REQUIRED", {
        severity: "medium",
        userMessage: "Please sign in",
      });
    }
    if (error.message.includes("not authorized")) {
      throw new AppError("You do not have permission", "UNAUTHORIZED", {
        severity: "high",
        userMessage: "Access denied",
      });
    }
  }
  throw error;
}
```

#### Usage Examples:

```typescript
// In components - BEFORE:
try {
  await createItem({ title });
  toast.success("Item created");
} catch (error) {
  toast.error("Failed to create item");
  console.error("Failed to create item:", error);
}

// AFTER:
import { handleError } from "@/lib/errors";

try {
  await createItem({ title });
  toast.success("Item created");
} catch (error) {
  handleError(error, {
    userMessage: "Failed to create item. Please try again.",
    severity: "medium",
  });
}
```

---

### 3. **DRY - Create Shared Validators** 🟡 Priority: Medium

#### Create Shared Validator Library:

```typescript
// convex/lib/validators.ts
import { v } from "convex/values";

// Base validators
export const idValidator = (tableName: string) => v.id(tableName);

export const timestampValidator = v.string();

export const priorityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);

// Item validators
export const itemBaseValidator = {
  _id: v.id("items"),
  userId: v.id("users"),
  title: v.string(),
  description: v.optional(v.string()),
  updatedAt: v.string(),
  isCompleted: v.boolean(),
  isDeleted: v.boolean(),
  isArchived: v.boolean(),
  priority: priorityValidator,
  tags: v.array(v.string()),
  notes: v.optional(v.string()),
  focusState: v.union(v.literal("today"), v.literal("back_burner")),
};

export const itemValidator = v.object(itemBaseValidator);

export const itemWithCreationTimeValidator = v.object({
  ...itemBaseValidator,
  _creationTime: v.number(),
});

// Bookmark validators
export const bookmarkBaseValidator = {
  _id: v.id("bookmarks"),
  userId: v.id("users"),
  url: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  favicon: v.optional(v.string()),
  thumbnail: v.optional(v.string()),
  screenshot: v.optional(v.string()),
  summary: v.optional(v.string()),
  extractedContent: v.optional(v.string()),
  tags: v.array(v.string()),
  collectionId: v.optional(v.id("bookmarkCollections")),
  isArchived: v.boolean(),
  isDeleted: v.boolean(),
  isPinned: v.boolean(),
  isRead: v.boolean(),
  isPublic: v.boolean(),
  createdAt: v.string(),
  updatedAt: v.string(),
  readAt: v.optional(v.string()),
  readingTime: v.optional(v.number()),
  searchText: v.string(),
};

export const bookmarkValidator = v.object(bookmarkBaseValidator);

export const bookmarkWithCreationTimeValidator = v.object({
  ...bookmarkBaseValidator,
  _creationTime: v.number(),
});

// Collection validators
export const collectionValidator = v.object({
  _id: v.id("bookmarkCollections"),
  userId: v.id("users"),
  name: v.string(),
  description: v.optional(v.string()),
  color: v.optional(v.string()),
  updatedAt: v.string(),
  isDeleted: v.boolean(),
});
```

#### Refactor Existing Code:

```typescript
// BEFORE: convex/items/queries.ts
returns: v.array(
  v.object({
    _id: v.id("items"),
    userId: v.id("users"),
    title: v.string(),
    // ... 15 more fields
  }),
);

// AFTER:
import { itemWithCreationTimeValidator } from "../lib/validators";

returns: v.array(itemWithCreationTimeValidator);
```

**Estimated Reduction:** ~600 lines of duplicated code

---

### 4. **Implement Error Boundaries** 🟡 Priority: Medium

```typescript
// components/error-boundary.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Report to error tracking
    // reportToSentry(error, errorInfo);

    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 border rounded-lg bg-destructive/10">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div className="flex gap-2">
            <Button onClick={this.handleRetry} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized boundaries
export function ItemListErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Failed to load items</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-2"
          >
            Reload
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
```

#### Usage in Layout:

```typescript
// app/(app)/layout.tsx
import { ErrorBoundary } from '@/components/error-boundary';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <UserSettingsProvider>
        <KeyboardNavigationProvider>
          {/* ... */}
        </KeyboardNavigationProvider>
      </UserSettingsProvider>
    </ErrorBoundary>
  );
}
```

---

## 🚀 Feature Recommendations

### Phase 1: High Impact (Immediate Value)

#### 1.1 **Bulk Operations**

Enable multi-select for batch actions on items and bookmarks.

```typescript
// hooks/use-bulk-selection.ts
export function useBulkSelection<T extends { _id: string }>() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = (items: T[]) => {
    setSelectedIds(new Set(items.map((i) => i._id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected: (id: string) => selectedIds.has(id),
  };
}
```

**Keyboard Shortcuts:**

- `Shift + Click` - Range select
- `Cmd/Ctrl + A` - Select all visible
- `Cmd/Ctrl + D` - Deselect all
- `Cmd/Ctrl + Shift + T` - Move selected to Today
- `Cmd/Ctrl + Shift + Delete` - Delete selected

#### 1.2 **Undo/Redo System**

Critical for a productivity app. Implement using command pattern:

```typescript
// lib/undo-stack.ts
interface Command {
  execute(): Promise<void>;
  undo(): Promise<void>;
  redo(): Promise<void>;
  description: string;
}

export class UndoStack {
  private stack: Command[] = [];
  private pointer = -1;
  private maxSize = 50;

  async execute(command: Command): Promise<void> {
    await command.execute();

    // Remove any redo commands
    this.stack = this.stack.slice(0, this.pointer + 1);

    // Add new command
    this.stack.push(command);
    this.pointer++;

    // Limit stack size
    if (this.stack.length > this.maxSize) {
      this.stack.shift();
      this.pointer--;
    }

    toast.success(command.description, {
      action: {
        label: "Undo",
        onClick: () => this.undo(),
      },
    });
  }

  async undo(): Promise<void> {
    if (this.pointer < 0) return;

    const command = this.stack[this.pointer];
    await command.undo();
    this.pointer--;

    toast.info(`Undid: ${command.description}`, {
      action: {
        label: "Redo",
        onClick: () => this.redo(),
      },
    });
  }

  async redo(): Promise<void> {
    if (this.pointer >= this.stack.length - 1) return;

    this.pointer++;
    const command = this.stack[this.pointer];
    await command.redo();

    toast.success(`Redid: ${command.description}`);
  }
}

// Usage in component:
const undoStack = useRef(new UndoStack()).current;

const handleDelete = async (itemId: string) => {
  const item = items.find((i) => i._id === itemId);
  if (!item) return;

  const deleteCommand: Command = {
    description: `Deleted "${item.title}"`,
    execute: async () => {
      await deleteItem({ itemId });
    },
    undo: async () => {
      await restoreItem({ itemId });
    },
    redo: async () => {
      await deleteItem({ itemId });
    },
  };

  await undoStack.execute(deleteCommand);
};
```

**Keyboard Shortcut:** `Cmd/Ctrl + Z` (undo), `Cmd/Ctrl + Shift + Z` (redo)

#### 1.3 **Search Filters & Advanced Search**

Current search is basic text matching. Add filters:

```typescript
// components/features/view/AdvancedSearch.tsx
interface SearchFilters {
  query: string;
  priority?: "low" | "medium" | "high";
  status?: "completed" | "incomplete" | "all";
  focusState?: "today" | "back_burner" | "all";
  tags: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Keyboard shortcut: `/` then `Tab` to filters
// Saved searches: Allow saving filter combinations
```

#### 1.4 **Offline Support**

Convex supports offline - implement queued mutations:

```typescript
// lib/offline-queue.ts
export class OfflineQueue {
  private queue: Mutation[] = [];
  private isOnline = true;

  constructor() {
    window.addEventListener("online", () => this.flush());
    window.addEventListener("offline", () => (this.isOnline = false));
  }

  async enqueue(mutation: Mutation) {
    if (this.isOnline) {
      return await this.execute(mutation);
    }

    this.queue.push(mutation);
    toast.info("Changes will sync when back online");
  }

  async flush() {
    this.isOnline = true;

    while (this.queue.length > 0) {
      const mutation = this.queue.shift();
      if (mutation) {
        await this.execute(mutation);
      }
    }

    toast.success("All changes synced");
  }
}
```

---

### Phase 2: Medium Impact (1-2 Months)

#### 2.1 **Recurring Items**

Add support for repeating tasks:

```typescript
// convex/schema.ts additions
recurringPattern: v.optional(v.object({
  frequency: v.union(
    v.literal('daily'),
    v.literal('weekly'),
    v.literal('monthly'),
    v.literal('custom')
  ),
  interval: v.number(), // every N days/weeks/months
  daysOfWeek: v.optional(v.array(v.number())), // 0-6 for weekly
  endDate: v.optional(v.string()),
  maxOccurrences: v.optional(v.number()),
})),
lastRecurrence: v.optional(v.string()),

// Cron job to generate recurring items
// convex/crons.ts
export const generateRecurringItems = internalMutation({
  handler: async (ctx) => {
    // Find items due for recurrence
    // Create new instances
  },
});
```

#### 2.2 **AI-Powered Tag Suggestions**

Use AI to suggest tags based on content:

```typescript
// convex/ai/tags/actions.ts
export const suggestTags = internalAction({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    existingTags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const prompt = `Given this bookmark:
Title: ${args.title}
Description: ${args.description}

Suggest 3-5 relevant tags from these categories:
- Topic (e.g., javascript, ai, productivity)
- Type (e.g., tutorial, article, tool)
- Priority (e.g., important, later)

Existing tags: ${args.existingTags.join(", ")}

Return only the new tags as a comma-separated list.`;

    const result = await ai.generateText({
      model: openrouter("gpt-4o-mini"),
      prompt,
    });

    return result.text.split(",").map((t) => t.trim());
  },
});
```

#### 2.3 **Bookmark Collections Sharing**

Enable public sharing links:

```typescript
// convex/schema.ts additions
shareConfig: v.optional(v.object({
  isPublic: v.boolean(),
  publicSlug: v.optional(v.string()),
  allowRead: v.boolean(),
  allowWrite: v.boolean(),
  password: v.optional(v.string()), // hashed
  expiresAt: v.optional(v.string()),
})),

// New route: /s/[slug] for public collections
```

#### 2.4 **Activity Analytics Dashboard**

User insights page:

```typescript
// convex/analytics/queries.ts
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const items = await ctx.db
      .query("items")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return {
      totalItems: items.length,
      completedItems: items.filter((i) => i.isCompleted).length,
      completionRate:
        items.length > 0
          ? items.filter((i) => i.isCompleted).length / items.length
          : 0,
      itemsByPriority: {
        low: items.filter((i) => i.priority === "low").length,
        medium: items.filter((i) => i.priority === "medium").length,
        high: items.filter((i) => i.priority === "high").length,
      },
      streakDays: calculateStreak(items),
    };
  },
});
```

---

### Phase 3: Nice to Have (2+ Months)

#### 3.1 **Browser Extension**

One-click bookmark capture:

```javascript
// Extension popup.js
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  const url = tabs[0].url;

  // Send to app
  await fetch("https://api.listit.app/bookmarks/quick-add", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ url }),
  });

  toast.success("Bookmark added!");
});
```

#### 3.2 **Mobile PWA**

Add service worker for offline capability and app-like experience:

```typescript
// app/sw.ts (service worker)
const CACHE_NAME = "listit-v1";
const urlsToCache = ["/", "/item", "/bookmarks", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

// Background sync for offline mutations
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-mutations") {
    event.waitUntil(syncPendingMutations());
  }
});
```

#### 3.3 **Import/Export Functionality**

Data portability:

```typescript
// convex/import-export/actions.ts
export const exportData = action({
  args: { format: v.union(v.literal("json"), v.literal("csv")) },
  handler: async (ctx, args) => {
    const items = await ctx.runQuery(api.items.queries.getUserItems);
    const bookmarks = await ctx.runQuery(
      api.bookmarks.bookmarkFunctions.getBookmarks,
    );

    if (args.format === "json") {
      return JSON.stringify({ items, bookmarks }, null, 2);
    }

    // CSV export
    return convertToCSV(items);
  },
});

export const importData = action({
  args: {
    data: v.string(),
    format: v.union(v.literal("json"), v.literal("csv")),
  },
  handler: async (ctx, args) => {
    // Validate and import
    // Handle duplicates
    // Report stats
  },
});
```

---

## ⚡ Performance Optimizations

### 1. **Implement Pagination**

Current: All items fetched at once  
Target: Paginated with infinite scroll

```typescript
// convex/items/queries.ts
export const getUserItemsPaginated = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(itemWithCreationTimeValidator),
    nextCursor: v.optional(v.string()),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const limit = args.limit ?? 50;

    let query = ctx.db
      .query("items")
      .withIndex("by_userId", (q) => q.eq("userId", userId));

    if (args.cursor) {
      query = query.filter((q) =>
        q.lt(q.field("_creationTime"), Number(args.cursor)),
      );
    }

    const items = await query.order("desc").take(limit + 1);

    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, -1) : items;

    return {
      items: results,
      nextCursor: hasMore
        ? String(results[results.length - 1]._creationTime)
        : undefined,
      hasMore,
    };
  },
});

// Frontend with infinite scroll:
// components/features/view/InfiniteItemList.tsx
import { useInfiniteQuery } from "convex/react";

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
  api.items.queries.getUserItemsPaginated,
  { initialCursor: undefined, limit: 50 },
  {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  },
);
```

### 2. **Virtualize Long Lists**

For lists > 50 items, use virtualization:

```typescript
// npm install @tanstack/react-virtual

import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualItemList({ items }: { items: Doc<"items">[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // px per item
  });

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <SingleItemListComponent item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. **Optimize Search Performance**

Move client-side search to Convex for large datasets:

```typescript
// convex/bookmarks/bookmarkFunctions.ts
export const searchBookmarks = query({
  args: {
    query: v.string(),
    filters: v.optional(
      v.object({
        isArchived: v.optional(v.boolean()),
        isRead: v.optional(v.boolean()),
        tags: v.optional(v.array(v.string())),
      }),
    ),
  },
  returns: v.array(bookmarkWithCreationTimeValidator),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Use Convex search index
    let results = await ctx.db
      .query("bookmarks")
      .withSearchIndex("search_bookmarks", (q) =>
        q.search("searchText", args.query).eq("userId", userId),
      )
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .take(100);

    // Apply additional filters
    if (args.filters) {
      results = results.filter((b) => {
        if (
          args.filters?.isArchived !== undefined &&
          b.isArchived !== args.filters.isArchived
        ) {
          return false;
        }
        if (
          args.filters?.isRead !== undefined &&
          b.isRead !== args.filters.isRead
        ) {
          return false;
        }
        if (args.filters?.tags && args.filters.tags.length > 0) {
          return args.filters.tags.some((tag) => b.tags.includes(tag));
        }
        return true;
      });
    }

    return results;
  },
});
```

### 4. **Bundle Optimization**

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable SWC minification
  swcMinify: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Code splitting
  experimental: {
    optimizePackageImports: ["@hugeicons/react", "lucide-react", "radix-ui"],
  },

  // Compression
  compress: true,

  // Production source maps (for debugging)
  productionBrowserSourceMaps: true,
};

export default nextConfig;
```

### 5. **Add Performance Monitoring**

```typescript
// lib/performance.ts
export function trackPerformance(label: string) {
  if (typeof window === "undefined") return;

  const start = performance.now();

  return {
    end: () => {
      const duration = performance.now() - start;
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);

      // Send to analytics
      // analytics.track('performance', { label, duration });
    },
  };
}

// Usage:
const perf = trackPerformance("item-list-render");
// ... render logic
perf.end();
```

---

## 🔒 Security Enhancements

### 1. **Rate Limiting on AI Actions**

Prevent abuse of expensive AI endpoints:

```typescript
// convex/lib/rate-limit.ts
import { RateLimiter } from "@convex-dev/rate-limiter";

const rateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
});

export async function checkAIRateLimit(
  ctx: any,
  userId: string,
  action: string,
): Promise<void> {
  const key = `ai:${userId}:${action}`;
  const allowed = await rateLimiter.check(ctx, key);

  if (!allowed) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }
}

// Usage in AI actions:
export const createBookMark = action({
  handler: async (ctx, args) => {
    await checkAIRateLimit(ctx, args.userId, "bookmark-extraction");
    // ... rest of handler
  },
});
```

### 2. **Input Sanitization**

Prevent XSS and injection attacks:

```typescript
// lib/sanitize.ts
import DOMPurify from "isomorphic-dompurify";

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML allowed in text fields
    ALLOWED_ATTR: [],
  });
}

// Usage in mutations:
export const createSingleItem = mutation({
  handler: async (ctx, args) => {
    const cleanTitle = sanitizeInput(args.title);
    const cleanDescription = args.description
      ? sanitizeInput(args.description)
      : undefined;

    // ... insert with sanitized data
  },
});
```

### 3. **CSP (Content Security Policy)**

```typescript
// next.config.ts additions
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self';
      connect-src 'self' https://*.convex.cloud https://api.openrouter.ai;
    `.replace(/\s+/g, ' ').trim(),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

// Add to next.config.ts:
async headers() {
  return [
    {
      source: '/:path*',
      headers: securityHeaders,
    },
  ];
}
```

### 4. **Audit Logging**

Track sensitive operations:

```typescript
// convex/lib/audit.ts
export async function logAudit(
  ctx: any,
  action: string,
  resource: string,
  resourceId: string,
  metadata?: Record<string, any>,
): Promise<void> {
  const userId = await getAuthUserId(ctx);

  await ctx.db.insert("auditLogs", {
    userId,
    action,
    resource,
    resourceId,
    metadata,
    timestamp: new Date().toISOString(),
    ip: ctx.request?.ip, // if available
  });
}

// Usage:
export const deleteSingleItem = mutation({
  handler: async (ctx, args) => {
    // ... delete logic

    await logAudit(ctx, "DELETE", "item", args.itemId, {
      title: item.title,
    });
  },
});
```

---

## 📊 Developer Experience Improvements

### 1. **Pre-Commit Hooks**

```json
// package.json
{
  "devDependencies": {
    "husky": "^9.x",
    "lint-staged": "^15.x"
  },
  "scripts": {
    "prepare": "husky install",
    "lint:staged": "eslint --fix",
    "format:staged": "prettier --write"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write", "vitest related --run"]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

### 2. **GitHub Actions CI/CD**

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npx tsc --noEmit

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
```

### 3. **Storybook for Component Documentation**

```bash
npx storybook@latest init
```

```typescript
// components/ui/button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  component: Button,
  title: "UI/Button",
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Click me",
    variant: "default",
  },
};
```

### 4. **API Documentation**

Generate OpenAPI spec from Convex:

```typescript
// scripts/generate-api-docs.ts
// Generate OpenAPI/Swagger documentation from Convex schema
```

### 5. **Database Migration Tooling**

```bash
# Add migration scripts
npm run db:migrate    # Run pending migrations
npm run db:rollback   # Rollback last migration
npm run db:seed       # Seed development data
```

---

## 📈 Success Metrics

Track these KPIs to measure improvement:

### Code Quality Metrics

- **Test Coverage**: Target 80%+ (currently 0%)
- **Type Coverage**: Target 100% (currently ~95%)
- **Lint Errors**: Target 0 (currently minimal)
- **Console.log Count**: Target 0 in production (currently 44)

### Performance Metrics

- **Lighthouse Score**: Target 90+ on all metrics
- **Time to Interactive**: Target < 2s
- **Bundle Size**: Target < 200KB initial JS
- **API Response Time**: Target < 200ms p95

### User Experience Metrics

- **Error Rate**: Target < 0.1%
- **User Retention**: Track daily/weekly active users
- **Feature Adoption**: Track AI feature usage
- **Keyboard Navigation Usage**: 70%+ of power users

---

## 🗓️ Prioritized Action Plan

### Week 1-2: Critical Foundation

1. **Set up testing infrastructure** (Jest/Vitest + Testing Library)
2. **Write tests for hooks** (useKeyboardNavigation, useBookmarkKeyboardNavigation)
3. **Fix outstanding TODOs** (3 items)
4. **Create error handling utility** (lib/errors.ts)
5. **Add error boundaries** to layouts

### Week 3-4: Code Quality

6. **Create shared validators** (convex/lib/validators.ts)
7. **Refactor Convex functions** to use shared validators
8. **Remove console.log statements** or replace with proper logging
9. **Standardize error handling** across all components
10. **Add pre-commit hooks** (husky + lint-staged)

### Month 2: Performance & Features

11. **Implement pagination** for items and bookmarks
12. **Add virtualization** for long lists
13. **Move search to Convex** for bookmarks
14. **Implement bulk operations**
15. **Add undo/redo system**

### Month 3: Advanced Features

16. **Implement recurring items**
17. **Add AI-powered tag suggestions**
18. **Create analytics dashboard**
19. **Add import/export functionality**
20. **Implement offline support**

### Month 4+: Expansion

21. **Build browser extension**
22. **Implement PWA capabilities**
23. **Add collaboration features**
24. **Create public sharing links**
25. **Build mobile app** (React Native or Capacitor)

---

## 🎓 Learning Resources

### Testing

- [Testing Library](https://testing-library.com/)
- [Convex Testing](https://docs.convex.dev/testing)
- [Playwright E2E](https://playwright.dev/)

### Performance

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Convex Best Practices](https://docs.convex.dev/performance)
- [React Virtualization](https://tanstack.com/virtual/latest)

### Security

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Convex Security](https://docs.convex.dev/security)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

---

## ✅ Review Checklist

Use this checklist to track progress:

### Testing

- [ ] Unit tests for hooks
- [ ] Component tests with React Testing Library
- [ ] Convex integration tests
- [ ] E2E tests with Playwright
- [ ] Coverage report > 80%

### Code Quality

- [ ] Shared validators implemented
- [ ] Error handling standardized
- [ ] Console.logs removed or properly categorized
- [ ] TODOs resolved
- [ ] Type coverage 100%

### Performance

- [ ] Pagination implemented
- [ ] Virtualization for long lists
- [ ] Search moved to Convex
- [ ] Bundle size < 200KB
- [ ] Lighthouse score > 90

### Features

- [ ] Bulk operations
- [ ] Undo/redo system
- [ ] Advanced search filters
- [ ] Recurring items
- [ ] AI tag suggestions

### Security

- [ ] Rate limiting on AI endpoints
- [ ] Input sanitization
- [ ] CSP headers
- [ ] Audit logging
- [ ] Security headers

### DX

- [ ] Pre-commit hooks
- [ ] GitHub Actions CI/CD
- [ ] Storybook setup
- [ ] API documentation
- [ ] Database migrations

---

## 🎯 Conclusion

**Listit** is an impressive productivity application with a solid foundation and ambitious vision. The combination of AI assistance, keyboard-driven UX, and real-time sync creates a compelling user experience. The codebase demonstrates good architectural decisions and modern tech choices.

**Priority Focus Areas:**

1. **Testing** - Critical gap that blocks confident iteration
2. **Error Handling** - Inconsistent patterns need standardization
3. **Code Deduplication** - Shared validators will reduce maintenance burden
4. **Performance** - Pagination and virtualization for scale
5. **Features** - Bulk ops, undo/redo, recurring items

**Estimated Timeline:**

- Foundation fixes: 4 weeks
- Performance improvements: 2 weeks
- Feature additions: 8 weeks
- **Total MVP improvements: 3 months**

With these improvements, Listit will have a production-ready, scalable, and maintainable codebase that can confidently support growth and new features.

---

**Reviewed by:** Senior Developer  
**Date:** January 30, 2026  
**Next Review:** April 30, 2026 (post-implementation)
