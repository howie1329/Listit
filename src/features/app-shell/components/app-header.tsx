import type { MouseEventHandler } from 'react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { SidebarTrigger } from '#/components/ui/sidebar'

type AppHeaderProps = {
  isReaderOpen: boolean
  onToggleReaderPanel: MouseEventHandler<HTMLButtonElement>
  onSignOut: MouseEventHandler<HTMLButtonElement>
}

export function AppHeader({
  isReaderOpen,
  onToggleReaderPanel,
  onSignOut,
}: AppHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-border/50 bg-background">
      <div className="flex h-full items-center justify-between gap-2 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-1">
          <SidebarTrigger className="shrink-0" />
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Listit Workspace
          </p>
        </div>

        <div className="hidden w-full max-w-md items-center md:flex">
          <Input
            aria-label="Global search placeholder"
            placeholder="Search bookmarks (coming soon)"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleReaderPanel}
          >
            {isReaderOpen ? 'Hide panel' : 'Show panel'}
          </Button>
          <Button type="button" variant="outline" size="sm">
            Profile
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
