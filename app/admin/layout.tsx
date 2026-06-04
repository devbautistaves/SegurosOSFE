import { OnboardingTour } from "@/components/onboarding-tour"
import { InstallAppPrompt } from "@/components/install-app-prompt"
import { PlanBanner } from "@/components/plan-banner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PlanBanner />
      <OnboardingTour />
      <InstallAppPrompt />
      {children}
    </>
  )
}
