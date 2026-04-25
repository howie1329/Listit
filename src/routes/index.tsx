import { Link, createFileRoute } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const features = [
    {
      title: 'Instant capture',
      description:
        'Save a URL in seconds. It appears immediately while extraction runs in the background.',
    },
    {
      title: 'Dedup + organization',
      description:
        'Canonical URL dedup, manual tags, and collections. Keep your library clean and browsable.',
    },
    {
      title: 'Reader + notes',
      description:
        'Reader view with extracted text and per-bookmark notes you can edit and keep.',
    },
    {
      title: 'Ask my bookmarks',
      description:
        'Get grounded answers with citations to the exact bookmarks (and notes) that support them.',
    },
  ] as const

  const steps = [
    {
      n: '01',
      title: 'Save',
      description:
        'Paste a link, hit enter. The bookmark shows up instantly as pending extraction.',
    },
    {
      n: '02',
      title: 'Enrich',
      description:
        'Background extraction pulls text; AI suggests tags/topics and collections—nothing forced.',
    },
    {
      n: '03',
      title: 'Ask',
      description:
        'Ask questions across your saved links and get answers grounded in retrieved chunks with citations.',
    },
  ] as const

  const faqs = [
    {
      q: 'Who is this for?',
      a: 'Solo users who want a keyboard-driven bookmarking system with trustworthy retrieval later.',
    },
    {
      q: 'Do I need AI features turned on?',
      a: 'No. You can save and organize manually. Auto-organization and auto notes are optional enhancements.',
    },
    {
      q: 'What’s in scope for MVP?',
      a: 'URL capture with dedup, tags/collections, background extraction, reader view + notes, and “Ask my bookmarks” with citations.',
    },
  ] as const

  return (
    <div className="min-h-dvh bg-background text-foreground">
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

      <main className="mx-auto w-full max-w-5xl px-4">
        <section className="py-10">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Keyboard-first bookmarking
            </p>
            <h1 className="mt-2 text-xl font-semibold leading-tight">
              Save links fast. Ask later with citations.
            </h1>
            <p className="mt-3 text-xs leading-snug text-muted-foreground">
              Listit is a personal bookmark library with background enrichment
              and grounded Q&A. Capture a URL, let extraction run, then ask
              questions backed by your saved sources.
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

        <section className="border-y border-border/50 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Designed for focus
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:flex sm:flex-wrap sm:justify-end sm:gap-4">
              {['Researchers', 'Students', 'Founders', 'Indie builders'].map(
                (label) => (
                  <div
                    key={label}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    {label}
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section id="features" className="py-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-base font-semibold leading-tight">Features</h2>
            <p className="text-[11px] text-muted-foreground">
              Minimal surface area. Strong fundamentals.
            </p>
          </div>

          <div className="mt-5 divide-y divide-border/50 border-t border-border/50">
            {features.map((f) => (
              <div key={f.title} className="grid gap-1 py-4 sm:grid-cols-12">
                <div className="text-xs font-semibold leading-tight sm:col-span-4">
                  {f.title}
                </div>
                <div className="text-xs leading-snug text-muted-foreground sm:col-span-8">
                  {f.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-border/50 py-10"
        >
          <div className="max-w-2xl">
            <h2 className="text-base font-semibold leading-tight">
              How it works
            </h2>
            <p className="mt-2 text-xs leading-snug text-muted-foreground">
              A simple loop you can repeat daily: save → enrich → ask.
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="border-t border-border/50 pt-4">
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {s.n}
                </div>
                <div className="mt-2 text-xs font-semibold leading-tight">
                  {s.title}
                </div>
                <div className="mt-1 text-xs leading-snug text-muted-foreground">
                  {s.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="border-t border-border/50 py-10">
          <div className="max-w-2xl">
            <h2 className="text-base font-semibold leading-tight">FAQ</h2>
            <p className="mt-2 text-xs leading-snug text-muted-foreground">
              Short answers to the things people ask first.
            </p>
          </div>

          <div className="mt-5 grid gap-2">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-lg border border-border/60 px-4 py-3"
              >
                <summary className="cursor-pointer text-xs font-medium leading-tight outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                  {item.q}
                </summary>
                <p className="mt-2 text-xs leading-snug text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section id="get-started" className="border-t border-border/50 py-10">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <h2 className="text-base font-semibold leading-tight">
                Start with one link.
              </h2>
              <p className="mt-2 text-xs leading-snug text-muted-foreground">
                Capture now, read later, and ask questions when you need an
                answer grounded in your saved sources.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
        </section>

        <footer className="border-t border-border/50 py-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} Listit
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <a href="#features">Features</a>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <a href="#faq">FAQ</a>
              </Button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
