# Listit Agent Guide

## Purpose

ListIt is a SvelteKit + Convex app for keyboard-driven bookmarking and grounded retrieval over saved links.

Agents should optimize for fast iteration, low complexity, and MVP delivery.

## Working Style

- Be concise, direct, and execution-focused.
- Prefer the smallest production-ready solution that fully meets the requirement.
- Keep code explicit, maintainable, and easy to modify.
- Avoid speculative abstractions, edge-case overengineering, and dependency bloat.
- Improve nearby code when helpful, but avoid unrelated refactors.

## Product Focus (MVP)

- Instant URL capture with deduplication.
- Manual organization with tags and collections.
- Background enrichment (extract, truncate, store).
- AI auto-organization (suggested tags/topics/collections).
- Optional per-bookmark AI auto note taking.
- Ask-my-bookmarks grounded answers with bookmark citations.
- Reader view with editable notes.

## Developer Commands

| Command               | Description                                      |
| --------------------- | ------------------------------------------------ |
| `npm run dev`         | Start local SvelteKit dev server (`vite dev`)   |
| `npm run build`       | Build production bundle                          |
| `npm run preview`     | Preview production build locally                 |
| `npm run check`       | Run `svelte-kit sync` and type/app checks        |
| `npm run check:watch` | Run Svelte checks in watch mode                  |
| `npm run lint`        | Run Prettier check and ESLint                    |
| `npm run format`      | Format code with Prettier                        |

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
