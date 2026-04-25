import { createFileRoute } from '@tanstack/react-router'

import { AppSectionPlaceholder } from '#/features/app-sections/components/app-section-placeholder'

export const Route = createFileRoute('/app/bookmarks')({
  component: BookmarksPage,
})

function BookmarksPage() {
  return <AppSectionPlaceholder eyebrow="Bookmarks" title="Bookmarks" />
}
