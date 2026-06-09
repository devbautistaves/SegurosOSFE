import { OnboardingTour } from "@/components/onboarding-tour"
import { OnboardingTrigger } from "@/components/onboarding/onboarding-trigger"
import { InstallAppPrompt } from "@/components/install-app-prompt"
import { PlanBanner } from "@/components/plan-banner"
import { PWARegister } from "@/components/pwa-register"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* PWA solo en el panel: la landing pública NO inyecta manifest/SW */}
      <PWARegister />
      <PlanBanner />
      {/* Wizard nuevo (jun 2026): se monta automáticamente si onboarding pendiente.
          Convive con el OnboardingTour viejo (driver.js) que queda como tour de
          features secundarias. */}
      <OnboardingTrigger />
      <OnboardingTour />
      <InstallAppPrompt />
      {children}
    </>
  )
}
