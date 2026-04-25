import { Link } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'

export function LandingHero() {
  return (
    <section className="py-10">
      <div className="max-w-2xl">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Keyboard-first bookmarking
        </p>
        <h1 className="mt-2 text-xl font-semibold leading-tight">
          Save links fast. Ask later with citations.
        </h1>
        <p className="mt-3 text-xs leading-snug text-muted-foreground">
          Listit is a personal bookmark library with background enrichment and
          grounded Q&A. Capture a URL, let extraction run, then ask questions
          backed by your saved sources.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button asChild size="lg">
            <Link to="/signup">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>
        <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
          Save first. Enrich in the background. Keep control.
        </p>
      </div>
    </section>
  )
}
