"use client";

import { Check, Loader2 } from "lucide-react";
import { Text } from "@/components/ui/text";
import { focusRing } from "@/components/ui/pressable";
import { useCityNames, useGetCities } from "@/lib/api/services/catalog";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

type CityRowListProps = {
  selected: string | null;
  onSelect: (city: string) => void;
};

export function CityRowList({ selected, onSelect }: CityRowListProps) {
  const cities = useCityNames();
  const { isLoading } = useGetCities();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-primary" aria-label={STRINGS.common.loading} />
      </div>
    );
  }

  if (cities.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Text variant="body-small" className="text-muted-foreground">
          {STRINGS.onboarding.town.loadError}
        </Text>
      </div>
    );
  }

  return (
    <ul>
      {cities.map((city) => {
        const isSelected = city === selected;
        return (
          <li key={city}>
            <button
              type="button"
              onClick={() => onSelect(city)}
              aria-pressed={isSelected}
              className={cn(
                "flex w-full items-center justify-between border-b border-border/50 py-3.5",
                "text-left transition-opacity active:opacity-70 hover:opacity-80",
                focusRing,
              )}
            >
              <span
                className={cn(
                  "font-sans text-[15px]",
                  isSelected
                    ? "font-bold text-primary"
                    : "font-medium text-foreground",
                )}
              >
                {city}
              </span>
              {isSelected && (
                <span className="flex size-6 items-center justify-center rounded-full bg-primary">
                  <Check
                    size={13}
                    strokeWidth={3}
                    className="text-primary-foreground"
                    aria-hidden
                  />
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
