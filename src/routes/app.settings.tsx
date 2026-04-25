import { createFileRoute } from '@tanstack/react-router'

import { AppSectionPlaceholder } from '#/features/app-sections/components/app-section-placeholder'

export const Route = createFileRoute('/app/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return <AppSectionPlaceholder eyebrow="Settings" title="Settings" />
}
