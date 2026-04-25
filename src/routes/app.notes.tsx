import { createFileRoute } from '@tanstack/react-router'

import { AppSectionPlaceholder } from '#/features/app-sections/components/app-section-placeholder'

export const Route = createFileRoute('/app/notes')({
  component: NotesPage,
})

function NotesPage() {
  return <AppSectionPlaceholder eyebrow="Notes" title="Notes" />
}
