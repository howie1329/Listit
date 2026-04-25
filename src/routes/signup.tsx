import { useState } from "react"
import { createFileRoute, Navigate } from "@tanstack/react-router"
import { useAuthActions } from "@convex-dev/auth/react"
import { useConvexAuth } from "convex/react"

import { AuthShell } from "#/components/auth/auth-shell"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
})

function SignUpPage() {
  const { signIn } = useAuthActions()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/app" />
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await signIn("password", {
        email,
        password,
        flow: "signUp",
      })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create account. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Create account"
      description="Start with one saved link and build your searchable library."
      switchLabel="Already have an account?"
      switchCta="Sign in"
      switchTo="/signin"
    >
      <form className="grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1.5 text-xs">
          <span className="text-muted-foreground">Email</span>
          <Input
            autoComplete="email"
            inputMode="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            required
          />
        </label>

        <label className="grid gap-1.5 text-xs">
          <span className="text-muted-foreground">Password</span>
          <Input
            autoComplete="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            minLength={8}
            required
          />
        </label>

        {error ? (
          <p className="text-xs leading-snug text-destructive">{error}</p>
        ) : (
          <p className="text-[11px] leading-snug text-muted-foreground">
            Use at least 8 characters for a stronger password.
          </p>
        )}

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  )
}
