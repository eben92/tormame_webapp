"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { FilterChip } from "@/components/ui/filter-chip";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { ENV } from "@/lib/env";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "system", label: STRINGS.settings.appearanceSystem },
  { value: "light", label: STRINGS.settings.appearanceLight },
  { value: "dark", label: STRINGS.settings.appearanceDark },
] as const;

export function SettingsScreen() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  // `theme` is only known in the browser; syncing it into render via
  // useSyncExternalStore keeps the first client render identical to the
  // server's instead of flipping state inside an effect.
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-background px-4 pt-3 pb-3 md:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={STRINGS.common.back}
          className={cn(
            "flex size-12 items-center justify-center rounded-full bg-muted text-foreground",
            pressableScale,
            focusRing,
          )}
        >
          <ArrowLeft size={20} aria-hidden />
        </button>
        <Text variant="h3">{STRINGS.settings.title}</Text>
      </div>

      <div className="mx-auto flex w-full max-w-[40rem] flex-1 flex-col gap-6 p-4 md:px-8 md:py-8">
        <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-4">
          <div className="flex flex-col gap-0.5">
            <Text variant="body-strong">{STRINGS.settings.appearanceTitle}</Text>
            <Text variant="body-small">
              {STRINGS.settings.appearanceSubtitle}
            </Text>
          </div>
          <div className="flex flex-wrap gap-2">
            {THEME_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                isActive={mounted && theme === option.value}
                onClick={() => setTheme(option.value)}
              />
            ))}
          </div>
        </section>

        {ENV.TERMS_URL ? (
          <section className="flex flex-col gap-1">
            <Text variant="caption" className="px-1">
              {STRINGS.settings.legalSectionTitle}
            </Text>
            <div className="overflow-hidden rounded-card border border-border bg-card">
              <a
                href={ENV.TERMS_URL}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "flex min-h-12 items-center justify-between px-4 py-3.5 hover:bg-muted/60",
                  focusRing,
                )}
              >
                <Text as="span" variant="body-strong">
                  {STRINGS.settings.termsOfService}
                </Text>
                <ChevronRight size={16} className="text-muted-foreground" aria-hidden />
              </a>
              <div className="h-px bg-border" />
              <a
                href={`${ENV.TERMS_URL}#privacy-policy`}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "flex min-h-12 items-center justify-between px-4 py-3.5 hover:bg-muted/60",
                  focusRing,
                )}
              >
                <Text as="span" variant="body-strong">
                  {STRINGS.settings.privacyPolicy}
                </Text>
                <ChevronRight size={16} className="text-muted-foreground" aria-hidden />
              </a>
            </div>
          </section>
        ) : null}

        <div className="flex items-center justify-between rounded-card border border-border bg-card px-4 py-3.5">
          <Text variant="body-strong">{STRINGS.settings.versionRowLabel}</Text>
          <Text variant="body-small">{ENV.APP_VERSION}</Text>
        </div>
      </div>
    </div>
  );
}
