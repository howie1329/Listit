import { Link } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'

export function LandingCta() {
  return (
    <section id="get-started" className="border-t border-border/50 py-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="max-w-xl">
          <h2 className="text-base font-semibold leading-tight">
            Start with one link.
          </h2>
          <p className="mt-2 text-xs leading-snug text-muted-foreground">
            Capture now, read later, and ask questions when you need an answer
            grounded in your saved sources.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/signup">Get started</Link>
        </Button>
      </div>
    </section>
  )
}
