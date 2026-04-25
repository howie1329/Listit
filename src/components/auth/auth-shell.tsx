import { Link } from "@tanstack/react-router"

type AuthShellProps = {
  title: string
  description: string
  switchLabel: string
  switchCta: string
  switchTo: "/signin" | "/signup"
  children: React.ReactNode
}

export function AuthShell({
  title,
  description,
  switchLabel,
  switchCta,
  switchTo,
  children,
}: AuthShellProps) {
  return (
    <main className="grid min-h-dvh bg-background text-foreground lg:grid-cols-[1.2fr_1fr]">
      <section className="hidden border-r border-border/50 lg:block">
        <div className="flex h-full flex-col justify-between p-10">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Listit
            </p>
            <h1 className="mt-4 max-w-md text-2xl font-semibold leading-tight">
              Save links with momentum. Retrieve answers with confidence.
            </h1>
            <p className="mt-3 max-w-sm text-xs leading-snug text-muted-foreground">
              Capture now, enrich in the background, and keep a library you can
              ask later with citations.
            </p>
          </div>
          <p className="text-[11px] leading-snug text-muted-foreground">
            Keyboard-first by default. Calm by design.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-sm border border-border/60 bg-background p-5 sm:p-6">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Account access
          </p>
          <h2 className="mt-2 text-base font-semibold leading-tight">{title}</h2>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            {description}
          </p>

          <div className="mt-5">{children}</div>

          <p className="mt-4 text-xs text-muted-foreground">
            {switchLabel}{" "}
            <Link to={switchTo} className="font-medium text-foreground underline">
              {switchCta}
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
