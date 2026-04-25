import { useState } from 'react'

type UseAuthSubmitOptions = {
  onSubmit: () => Promise<void>
  fallbackError: string
}

export function useAuthSubmit({
  onSubmit,
  fallbackError,
}: UseAuthSubmitOptions) {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submitWithState() {
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit()
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : fallbackError,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    error,
    isSubmitting,
    submitWithState,
  }
}
