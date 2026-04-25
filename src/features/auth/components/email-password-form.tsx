import type { FormEvent } from 'react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

type EmailPasswordFormProps = {
  email: string
  password: string
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  submitLabel: string
  submittingLabel: string
  passwordAutoComplete: 'current-password' | 'new-password'
  passwordMinLength?: number
  error?: string | null
  helperText?: string
}

export function EmailPasswordForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  isSubmitting,
  submitLabel,
  submittingLabel,
  passwordAutoComplete,
  passwordMinLength,
  error,
  helperText,
}: EmailPasswordFormProps) {
  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      <label className="grid gap-1.5 text-xs">
        <span className="text-muted-foreground">Email</span>
        <Input
          autoComplete="email"
          inputMode="email"
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.currentTarget.value)}
          required
        />
      </label>

      <label className="grid gap-1.5 text-xs">
        <span className="text-muted-foreground">Password</span>
        <Input
          autoComplete={passwordAutoComplete}
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.currentTarget.value)}
          minLength={passwordMinLength}
          required
        />
      </label>

      {error ? (
        <p className="text-xs leading-snug text-destructive">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] leading-snug text-muted-foreground">
          {helperText}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </form>
  )
}
