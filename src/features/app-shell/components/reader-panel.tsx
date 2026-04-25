export function ReaderPanel() {
  return (
    <aside className="hidden w-88 shrink-0 border-l border-border/50 p-4 lg:block">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Reader and notes
      </p>
      <h2 className="mt-1 text-base font-semibold leading-tight">
        Preview panel
      </h2>
      <p className="mt-3 text-xs leading-snug text-muted-foreground">
        This optional panel is reserved for bookmark reader content and editable
        notes.
      </p>
    </aside>
  )
}
