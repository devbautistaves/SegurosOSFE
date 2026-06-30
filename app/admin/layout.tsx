import { OnboardingTrigger } from "@/components/onboarding/onboarding-trigger"
import { InstallAppPrompt } from "@/components/install-app-prompt"
import { PlanBanner } from "@/components/plan-banner"
import { PromoMundialistaPopup } from "@/components/promo-mundialista-popup"
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
      <PromoMundialistaPopup />
      {/* Wizard nuevo de onboarding (4 fases). El tour viejo de driver.js
          se removió — el reabrir se hace disparando "onboarding-reopen". */}
      <OnboardingTrigger />
      <InstallAppPrompt />
      {children}
    </>
  )
}
