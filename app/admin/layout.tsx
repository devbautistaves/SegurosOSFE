import { OnboardingTour } from "@/components/onboarding-tour"
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
      <OnboardingTour />
      <InstallAppPrompt />
      {children}
    </>
  )
}
