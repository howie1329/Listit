# Library UI Modernization

## Problem

The logged-in Library screen has a solid functional foundation, but the URL capture, empty state, bookmark rows, and inspector feel too flat and same-weight. First-time users should immediately understand that saving a URL is the primary action, while returning users should still get a compact, efficient library workspace.

## Scope

- Make the Library header and URL capture area more intentional and action-oriented.
- Use a plain, polished centered empty state when no bookmarks exist.
- Refine populated bookmark rows while preserving a dense table-like layout.
- Use existing metadata (`faviconUrl`, `description`, `siteName`, status, tags, collections) for selective richer rows with clean fallbacks.
- Improve selected bookmark inspector hierarchy without changing behavior.
- Keep search global only.

## Out of scope

- Schema migrations or backend metadata changes.
- Fake/example bookmarks.
- Onboarding checklist.
- Card grid view or image-thumbnail rows.
- Local Library search/filter controls.
- Global theme/color token changes.
- Decorative gradients or routine card stacks.
- Persistent inspector preference.

## Acceptance criteria

- The URL capture control is the clear primary action on the Library page.
- Empty state is minimal, centered, and does not show a dead table header.
- Bookmark rows remain dense but become more scannable with favicon/fallback, optional description, and clearer status treatment.
- Inspector is easier to scan and keeps all current capabilities.
- Empty Library state does not compete with a blank inspector.
- Styling follows `docs/design-system.md` and uses semantic tokens.
- Existing save, selection, collection, tag, retry, Ask, and note behaviors remain intact.

## Implementation plan

1. Update `library-header.svelte` copy, spacing, and capture styling.
2. Update `bookmark-list.svelte` to hide headers when empty, improve empty state, and refine rows.
3. Update `+page.svelte` inspector visibility and hierarchy.
4. Run Svelte autofixer, `npm run check`, and `npm run lint`.

## Files likely to change

- `src/lib/components/library/library-header.svelte`
- `src/lib/components/library/bookmark-list.svelte`
- `src/routes/(app)/app/+page.svelte`

## Risks

- Some bookmarks may lack favicons or descriptions; rows need clean fallbacks.
- Richer row content may reduce density if not tightly constrained.
- Inspector markup changes could affect existing forms if handlers are disturbed.

## Manual QA steps

- Empty Library state.
- Populated Library state.
- Save valid URL.
- Invalid URL error.
- Duplicate URL save behavior.
- Pending/enriched/failed rows.
- Bookmark selection.
- Inspector open/close.
- Collection assignment.
- Tag editing.
- Note saving.
- Responsive widths.
- Keyboard focus visibility.
