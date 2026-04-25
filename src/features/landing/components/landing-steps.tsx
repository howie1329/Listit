import { STEPS } from '#/features/landing/content'

export function LandingSteps() {
  return (
    <section id="how-it-works" className="border-t border-border/50 py-10">
      <div className="max-w-2xl">
        <h2 className="text-base font-semibold leading-tight">How it works</h2>
        <p className="mt-2 text-xs leading-snug text-muted-foreground">
          A simple loop you can repeat daily: save → enrich → ask.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n} className="border-t border-border/50 pt-4">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {step.n}
            </div>
            <div className="mt-2 text-xs font-semibold leading-tight">
              {step.title}
            </div>
            <div className="mt-1 text-xs leading-snug text-muted-foreground">
              {step.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
