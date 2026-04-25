import { Link } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'

export function LandingHeader() {
  return (
    <header className="border-b border-border/50">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground"
          >
            <span className="text-xs font-semibold leading-none">L</span>
          </div>
          <span className="text-xs font-semibold leading-none">Listit</span>
        </div>

        <nav aria-label="Primary" className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <a href="#features">Features</a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href="#how-it-works">How it works</a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href="#faq">FAQ</a>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup">Sign up</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/signin">Sign in</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
