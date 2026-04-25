import { createFileRoute } from '@tanstack/react-router'

import { LandingAudience } from '#/features/landing/components/landing-audience'
import { LandingCta } from '#/features/landing/components/landing-cta'
import { LandingFaq } from '#/features/landing/components/landing-faq'
import { LandingFeatures } from '#/features/landing/components/landing-features'
import { LandingFooter } from '#/features/landing/components/landing-footer'
import { LandingHeader } from '#/features/landing/components/landing-header'
import { LandingHero } from '#/features/landing/components/landing-hero'
import { LandingSteps } from '#/features/landing/components/landing-steps'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <LandingHeader />

      <main className="mx-auto w-full max-w-5xl px-4">
        <LandingHero />
        <LandingAudience />
        <LandingFeatures />
        <LandingSteps />
        <LandingFaq />
        <LandingCta />
        <LandingFooter />
      </main>
    </div>
  )
}
