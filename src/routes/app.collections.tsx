import { createFileRoute } from '@tanstack/react-router'

import { AppSectionPlaceholder } from '#/features/app-sections/components/app-section-placeholder'

export const Route = createFileRoute('/app/collections')({
  component: CollectionsPage,
})

function CollectionsPage() {
  return <AppSectionPlaceholder eyebrow="Collections" title="Collections" />
}
