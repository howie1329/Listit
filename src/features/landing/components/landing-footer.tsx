import { Button } from '#/components/ui/button'

export function LandingFooter() {
  return (
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
  )
}
