import { useState, type FormEvent } from 'react'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthActions } from '@convex-dev/auth/react'
import { useConvexAuth } from 'convex/react'

import { AuthShell } from '#/components/auth/auth-shell'
import { EmailPasswordForm } from '#/features/auth/components/email-password-form'
import { useAuthSubmit } from '#/features/auth/hooks/use-auth-submit'

export const Route = createFileRoute('/signin')({
  component: SignInPage,
})

function SignInPage() {
  const { signIn } = useAuthActions()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { error, isSubmitting, submitWithState } = useAuthSubmit({
    onSubmit: async () => {
      await signIn('password', {
        email,
        password,
        flow: 'signIn',
      })
    },
    fallbackError: 'Unable to sign in. Please try again.',
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
      title="Sign in"
      description="Use your email and password to access your workspace."
      switchLabel="Need an account?"
      switchCta="Create one"
      switchTo="/signup"
    >
      <EmailPasswordForm
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Sign in"
        submittingLabel="Signing in..."
        passwordAutoComplete="current-password"
        error={error}
      />
    </AuthShell>
  )
}
