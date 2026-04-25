type AppSectionPlaceholderProps = {
  eyebrow: string
  title: string
  description?: string
}

export function AppSectionPlaceholder({
  eyebrow,
  title,
  description = 'Empty page.',
}: AppSectionPlaceholderProps) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="mt-1 text-xl font-semibold leading-tight">{title}</h1>
      <p className="mt-3 text-xs leading-snug text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
