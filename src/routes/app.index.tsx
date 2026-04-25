import { createFileRoute } from '@tanstack/react-router'

import { AppSectionPlaceholder } from '#/features/app-sections/components/app-section-placeholder'

export const Route = createFileRoute('/app/')({
  component: AppIndexPage,
})

function AppIndexPage() {
  return (
    <AppSectionPlaceholder
      eyebrow="Workspace"
      title="App home"
      description="Choose a section from the sidebar."
    />
  )
}
