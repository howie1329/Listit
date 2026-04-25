import { AUDIENCES } from '#/features/landing/content'

export function LandingAudience() {
  return (
    <section className="border-y border-border/50 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Designed for focus
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:flex sm:flex-wrap sm:justify-end sm:gap-4">
          {AUDIENCES.map((label) => (
            <div
              key={label}
              className="text-xs font-medium text-muted-foreground"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
