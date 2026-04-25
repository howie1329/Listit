import { FAQS } from '#/features/landing/content'

export function LandingFaq() {
  return (
    <section id="faq" className="border-t border-border/50 py-10">
      <div className="max-w-2xl">
        <h2 className="text-base font-semibold leading-tight">FAQ</h2>
        <p className="mt-2 text-xs leading-snug text-muted-foreground">
          Short answers to the things people ask first.
        </p>
      </div>

      <div className="mt-5 grid gap-2">
        {FAQS.map((item) => (
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
  )
}
