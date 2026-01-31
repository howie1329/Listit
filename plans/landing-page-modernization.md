# Landing Page Modernization Plan

## Project: Listit Landing Page Update

### Objective

Modernize the landing page with a clean, centered design using theme tokens, and convert the authentication flow to a tabbed interface.

---

## Current State Analysis

### Files to Modify

1. **LandingPageContent.tsx** - Uses slate colors, needs theme tokens + modernization
2. **AuthComponents.tsx** - Uses toggle link, needs shadcn Tabs + theme tokens
3. **page.tsx** - Structure is good (60/40 split), may need minor adjustments

### Already Available

- ✅ Tabs component installed (`components/ui/tabs.tsx`)
- ✅ Button, Input components exist
- ✅ Convex auth already working
- ✅ 60/40 layout already implemented

---

## Implementation Details

### 1. LandingPageContent.tsx Changes

#### Color Migration (Slate → Theme Tokens)

| Current                              | New                     |
| ------------------------------------ | ----------------------- |
| `text-slate-900 dark:text-slate-100` | `text-foreground`       |
| `text-slate-600 dark:text-slate-400` | `text-muted-foreground` |
| `text-slate-700 dark:text-slate-300` | `text-foreground/80`    |

#### Required Imports

```typescript
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TaskEditIcon,
  BookmarkIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
```

#### Layout Changes

- Keep centered layout with `items-center justify-center`
- Change from `max-w-xl` to wider container for better spacing
- Convert features from vertical list to horizontal row (3 columns)
- Add CTA buttons (disabled, no handlers)

#### New Structure

```
┌─────────────────────────────────────────────────────────┐
│                    List It                              │
│           (text-7xl font-bold)                          │
│                                                         │
│   Organize your tasks and bookmarks in one simple      │
│   place.                                                │
│                                                         │
│   [Get Started] [Learn More]  ← CTA buttons (disabled) │
│                                                         │
│   ───────────────────────────────────────────────────  │
│                                                         │
│   [📋]    [🔖]    [🔄]                                  │
│ Task   Bookmark   Stay in Sync                          │
│ Lists  Collections                                     │
└─────────────────────────────────────────────────────────┘
```

### 2. AuthComponents.tsx Changes

#### Major Refactor

- Replace toggle link with shadcn Tabs
- Wrap form in Tabs component with two tabs: "Sign In" | "Sign Up"
- Keep existing Convex auth logic entirely
- Maintain form fields (email, password only)

#### Color Migration

| Current                              | New                     |
| ------------------------------------ | ----------------------- |
| `text-slate-900 dark:text-slate-100` | `text-foreground`       |
| `text-slate-600 dark:text-slate-400` | `text-muted-foreground` |
| `text-red-600`                       | `text-destructive`      |
| `bg-red-50`                          | `bg-destructive/10`     |
| `border-red-200`                     | `border-destructive/20` |

#### Required Imports

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
```

#### New Structure

```
┌─────────────────────────────┐
│  [Sign In]  [  Sign Up  ]   │  ← Tab bar
├─────────────────────────────┤
│                             │
│  Email                      │
│  [________________________] │
│                             │
│  Password                   │
│  [________________________] │
│                             │
│  [Sign In]                  │  ← Button text changes
│                             │
│  Forgot password?           │
└─────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Update LandingPageContent.tsx

1. Add imports (Button, HugeiconsIcon, TaskEditIcon, BookmarkIcon, RefreshIcon)
2. Convert all slate colors to theme tokens
3. Add CTA buttons (disabled, no onClick handlers yet)
4. Reorganize features into horizontal row with icons
5. Keep FeatureItem inline or extract to separate file

### Step 2: Update AuthComponents.tsx

1. Add Tabs import
2. Replace toggle flow mechanism with Tabs component
3. Convert all slate colors to theme tokens
4. Keep Convex auth logic unchanged
5. Ensure tab switching works immediately (no animation)

### Step 3: Verify Layout

- Check 60/40 split still works
- Verify no scrolling occurs
- Test auth still functions with Convex
- Confirm dark/light mode switching works

---

## Design Decisions

### Left Column (LandingPageContent)

- **Layout:** Centered, vertically and horizontally
- **Hero:** "List It" in large bold text (text-7xl)
- **Tagline:** Below hero, muted color
- **CTAs:** Two buttons (primary and outline), currently disabled
- **Features:** 3 items in horizontal row with Hugeicons icons
- **Colors:** All theme tokens (no slate)

### Right Column (AuthComponents)

- **Layout:** Tabbed interface with shadcn Tabs
- **Tabs:** "Sign In" and "Sign Up" side by side
- **Form:** Email + Password only (no name field for sign up)
- **Auth:** Convex (@convex-dev/auth/react) - already working
- **Colors:** All theme tokens (no slate, no red)
- **Behavior:** Tabs switch immediately, no animation

---

## Files to Modify

```
components/features/landingPage/
├── LandingPageContent.tsx    # Full rewrite with theme tokens + icons
└── AuthComponents.tsx        # Add tabs, convert colors
```

---

## Success Criteria

- [ ] Landing page renders without errors
- [ ] 60/40 layout maintained on desktop
- [ ] No scrolling required
- [ ] Tabbed auth interface works
- [ ] Convex auth still functional
- [ ] Theme switching works (dark/light mode)
- [ ] All slate colors converted to theme tokens
- [ ] Hugeicons display correctly

---

## Technical Notes

### Tailwind Theme Tokens Available

From `app/globals.css`:

- `bg-background`, `text-foreground`
- `bg-card`, `text-card-foreground`
- `bg-muted`, `text-muted-foreground`
- `text-primary`, `text-primary-foreground`
- `text-destructive`, `bg-destructive/10`
- `border`, `border-border`

### Shadcn Components Available

- `Button` (with variants: default, outline, secondary, ghost, destructive, link)
- `Input` (with h-11 sizing)
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` (newly installed)

### Convex Auth

- Uses `@convex-dev/auth/react`
- Hook: `useAuthActions()` with `signIn("password", { email, password, flow })`
- Flow: "signIn" or "signUp"
- Already working - DO NOT MODIFY logic

---

## Open Questions (To Resolve Before Implementation)

1. **FeatureItem component:** Keep as inline component in LandingPageContent.tsx or extract to separate file?

2. **Button sizing:** Use `size="lg"` (h-8) or custom sizing for CTA buttons? (Note: shadcn buttons default to h-7)

3. **Icon usage:** Use `HugeiconsIcon` component or direct icon imports like `<TaskEditIcon className="..." />`?

4. **Layout on mobile:** Keep 60/40 split or stack vertically on smaller screens?

---

## Ready to Execute

When ready to implement:

1. Confirm answers to open questions above
2. Execute Step 1: LandingPageContent.tsx
3. Execute Step 2: AuthComponents.tsx
4. Execute Step 3: Verification

All changes follow existing codebase patterns and use available shadcn components.
