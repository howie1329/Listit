import { useState, type FormEvent } from 'react'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthActions } from '@convex-dev/auth/react'
import { useConvexAuth } from 'convex/react'

import { AuthShell } from '#/components/auth/auth-shell'
import { EmailPasswordForm } from '#/features/auth/components/email-password-form'
import { useAuthSubmit } from '#/features/auth/hooks/use-auth-submit'

export const Route = createFileRoute('/signup')({
  component: SignUpPage,
})

function SignUpPage() {
  const { signIn } = useAuthActions()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { error, isSubmitting, submitWithState } = useAuthSubmit({
    onSubmit: async () => {
      await signIn('password', {
        email,
        password,
        flow: 'signUp',
      })
    },
    fallbackError: 'Unable to create account. Please try again.',
  })

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/app" />
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await submitWithState()
  }

  return (
    <AuthShell
      title="Create account"
      description="Start with one saved link and build your searchable library."
      switchLabel="Already have an account?"
      switchCta="Sign in"
      switchTo="/signin"
    >
      <EmailPasswordForm
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Create account"
        submittingLabel="Creating account..."
        passwordAutoComplete="new-password"
        passwordMinLength={8}
        error={error}
        helperText="Use at least 8 characters for a stronger password."
      />
    </AuthShell>
  )
}
