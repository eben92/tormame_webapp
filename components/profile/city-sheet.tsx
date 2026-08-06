"use client";

import { CityRowList } from "@/components/shared/city-row-list";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { STRINGS } from "@/lib/strings";
import { useOnboardingStore } from "@/stores/onboarding";

export function CitySheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const city = useOnboardingStore((state) => state.city);
  const setCity = useOnboardingStore((state) => state.setCity);

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={STRINGS.profile.townSheet.title}
      description={STRINGS.profile.townSheet.subtitle}
    >
      <div className="px-5">
        <div className="border-t border-border/60" />
      </div>
      <div className="px-5 pt-2 pb-6">
        <CityRowList
          selected={city}
          onSelect={(selected) => {
            setCity(selected);
            onOpenChange(false);
          }}
        />
      </div>
    </ResponsiveSheet>
  );
}
