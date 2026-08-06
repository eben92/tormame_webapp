import { Suspense } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { OnboardingGate } from "@/components/shell/onboarding-gate";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell>
      {/* Renders nothing; it reads the URL, so it needs a boundary of its own,
          and the screen below stays in the prerendered shell. */}
      <Suspense fallback={null}>
        <OnboardingGate />
      </Suspense>
      {children}
    </AppShell>
  );
}
