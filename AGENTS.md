# Listit Agent Guide

## Guidelines

- Act like a high-performing senior engineer: concise, direct, execution-focused.
- Prefer simple, maintainable, production-friendly solutions.
- Keep code low-complexity, explicit, and easy to modify.
- Choose the smallest solution that fully solves the requirement.
- Avoid overengineering, unnecessary abstractions, and dependency bloat.
- Write code another engineer can quickly understand and ship.
- Do not add speculative edge-case behavior not required today.

## Maintainability

- Reduce duplication; extract shared logic when it improves clarity.
- Favor small APIs and explicit behavior over clever patterns.
- Improve nearby code when touching it, but avoid broad unrelated refactors.

## Developer Commands

| Command           | Description                           |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start TanStack Start dev server       |
| `npm run build`   | Production build                      |
| `npm run preview` | Preview production build              |
| `npm run test`    | Run tests with Vitest                 |
| `npm run lint`    | Run ESLint                            |
| `npm run format`  | Check formatting with Prettier        |
| `npm run check`   | Auto-fix format + lint where possible |

## Environment

Required for local app + Convex integration:

- `VITE_CONVEX_URL`: Convex deployment URL (used by `src/integrations/convex/provider.tsx`).

Optional variables may be added by specific features; document them in feature docs when introduced.

## Stack

- TanStack Start + TanStack Router
- React 19 + TypeScript
- Tailwind CSS v4
- Convex + `@convex-dev/auth`
- Vitest + Testing Library

## Convex Rules

- Always read `convex/_generated/ai/guidelines.md` before editing Convex code.
- Follow generated Convex patterns over generic assumptions.
- Keep schema and function validators strict and explicit.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.

<!-- convex-ai-end -->
