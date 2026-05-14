# THS-36 Settings Page Brief

## Problem

The existing settings page is a thin placeholder. Users need a clearer preview of the account, AI model, usage limits, and stats areas that will become functional later.

## Scope

- Replace the `/app/settings` placeholder with a polished UI-only settings page.
- Keep existing `/app/settings` route and sidebar navigation unchanged.
- Add local-only interactions for display name and AI model selection.
- Show mock usage limits and library stats.
- Keep Save changes visible but disabled.

## Out of scope

- Persisting settings.
- Convex mutations or new schema.
- Real usage metering or billing limits.
- Sidebar/navigation changes.
- New reusable components.

## Acceptance criteria

- Settings page contains Account, AI model, Usage & Limits, and Stats sections.
- Workspace and Notifications placeholders are removed.
- Account name is locally editable; email is read-only.
- AI model selector is locally interactive.
- Usage and stats are displayed with mock values.
- UI follows `docs/design-system.md` density, tokens, and seam-based layout.
- `npm run check` and `npm run lint` pass or any failures are documented.

## Implementation plan

1. Update `src/routes/(app)/app/settings/+page.svelte` in place.
2. Keep the split settings layout with desktop section navigation.
3. Add static mock arrays for usage and stats data.
4. Use existing UI primitives and native controls where sufficient.
5. Validate with Svelte autofixer, `npm run check`, and `npm run lint`.

## Files likely to change

- `docs/settings-page-brief.md`
- `src/routes/(app)/app/settings/+page.svelte`

## Risks

- Placeholder interactivity could imply persistence; helper copy and disabled Save should make this clear.
- Native select styling must remain aligned with existing input density.

## Manual QA steps

- Visit `/app/settings` while signed in.
- Confirm section nav anchors jump to Account, AI model, Usage & Limits, and Stats.
- Type into display name and select a different AI model.
- Confirm Save changes remains disabled.
- Confirm usage and stats render with mock values in light and dark themes.
