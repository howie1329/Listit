# THS-35 Marketing Pages Brief

## Problem

The current public marketing pages explain ListIt, but they rely on decorative effects and card-heavy product previews that drift from the Linear-inspired design system. THS-35 needs the marketing surface to feel modern, simple, and clear about the product.

## Scope

- Refresh the landing page at `/`.
- Refresh the roadmap page at `/roadmap`.
- Add a concise about page at `/about`.
- Update public navigation for the added page.

## Out Of Scope

- Contact page or form.
- Convex, auth, schema, and app workspace changes.
- Global theme token changes.
- New dependencies or reusable custom component abstractions.

## Acceptance Criteria

- Landing page communicates ListIt as bookmark memory in the first viewport.
- Roadmap lists the MVP product phases in a compact design-system-compliant layout.
- About page explains what ListIt is, who it is for, and what the MVP intentionally keeps small.
- Public pages use tokenized colors, compact typography, subtle seams, and the continuous canvas.
- Auth-aware CTA behavior remains unchanged.

## Implementation Plan

- Replace decorative public layout backgrounds with the plain tokenized canvas.
- Add `About` to the public nav next to `Roadmap`.
- Rebuild the landing page around a compact product message and flat workspace preview.
- Rebuild the roadmap page as rows with status metadata instead of stacked cards.
- Add `/about` with concise product context and no extra page chrome.

## Files Likely To Change

- `src/routes/(public)/+layout.svelte`
- `src/routes/(public)/+page.svelte`
- `src/routes/(public)/roadmap/+page.svelte`
- `src/routes/(public)/about/+page.svelte`

## Risks

- The landing page must balance density with readability on mobile.
- Public copy must stay practical and avoid overselling features that are not implemented yet.

## Manual QA

- Verify `/`, `/roadmap`, `/about`, `/login`, and `/signup` render in light and dark mode.
- Confirm public nav active states for roadmap and about.
- Confirm signed-in users see `Go to App`; signed-out users see sign-in/sign-up CTAs.
- Confirm no decorative gradients, hardcoded colors, or card-heavy marketing sections were added.
