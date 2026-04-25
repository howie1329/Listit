import { FEATURES } from '#/features/landing/content'

export function LandingFeatures() {
  return (
    <section id="features" className="py-10">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold leading-tight">Features</h2>
        <p className="text-[11px] text-muted-foreground">
          Minimal surface area. Strong fundamentals.
        </p>
      </div>

      <div className="mt-5 divide-y divide-border/50 border-t border-border/50">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="grid gap-1 py-4 sm:grid-cols-12">
            <div className="text-xs font-semibold leading-tight sm:col-span-4">
              {feature.title}
            </div>
            <div className="text-xs leading-snug text-muted-foreground sm:col-span-8">
              {feature.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
