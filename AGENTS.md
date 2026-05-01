# Listit Agent Guide

## Purpose

ListIt is a SvelteKit + Convex app for keyboard-driven bookmarking and grounded retrieval over saved links.

Agents should optimize for fast iteration, low complexity, and MVP delivery.

## Guidelines

- Act like a high-performing senior engineer. Be concise, direct, decisive, and execution-focused.
- Solve problems with simple, maintainable, production-friendly solutions.
- Prefer low-complexity code that is easy to read, debug, and modify.
- Prefer the smallest path.
- Do not overengineer. Do not introduce heavy abstractions,extra layers, or fallbacks, or large dependencies for small features. Choose the smallest solution that solves the problem well.
- Keep implementations clean, APIs small, behavior explicit, and naming clear. Avoid cleverness unless it clearly improves the outcome.
- Write code that another strong engineer can quickly understand, safely extend, and confidently ship.
- Always assume there are no current users and the database is empty.

## DO NOT

- DO NOT add edge-case logic for scenarios that aren't in the current requirements
- Do don't create your own components without checking if a component already exists.

## Maintainability

Long term maintainability is a core priority. If you add new functionality, first check if there is shared logic that can be extracted to a separate module. Duplicate logic across multiple files is a code smell and should be avoided. Don't be afraid to change existing code. Don't take shortcuts by just adding local logic to solve a problem.

## Working Style

- Be concise, direct, and execution-focused.
- Prefer the smallest production-ready solution that fully meets the requirement.
- Keep code explicit, maintainable, and easy to modify.
- Avoid speculative abstractions, edge-case overengineering, and dependency bloat.
- Improve nearby code when helpful, but avoid unrelated refactors.
- Use existing shadcn-svelte components before creating custom UI.
- Do not create reusable custom components unless the task explicitly needs them.
- Do not change global color tokens or theme colors in `src/routes/layout.css` without explicit approval.

## Product Focus (MVP)

- Instant URL capture with deduplication.
- Manual organization with tags and collections.
- Background enrichment (extract, truncate, store).
- AI auto-organization (suggested tags/topics/collections).
- Optional per-bookmark AI auto note taking.
- Ask-my-bookmarks grounded answers with bookmark citations.
- Reader view with editable notes.

## Developer Commands

| Command               | Description                                   |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | Start local SvelteKit dev server (`vite dev`) |
| `npm run build`       | Build production bundle                       |
| `npm run preview`     | Preview production build locally              |
| `npm run check`       | Run `svelte-kit sync` and type/app checks     |
| `npm run check:watch` | Run Svelte checks in watch mode               |
| `npm run lint`        | Run Prettier check and ESLint                 |
| `npm run format`      | Format code with Prettier                     |

## Environment

Required for local app + Convex integration:

- `VITE_CONVEX_URL`: Convex deployment URL.

Document new environment variables in feature docs when introduced.

## Stack

- SvelteKit + Vite + TypeScript
- Svelte 5
- Tailwind CSS v4
- Convex backend + `@convex-dev/auth`
- ESLint + Prettier + `svelte-check`

## Convex Rules

- Always read `convex/_generated/ai/guidelines.md` before editing Convex code.
- Follow generated Convex patterns over generic assumptions.
- Keep schema and function validators strict and explicit.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.

<!-- convex-ai-end -->
