"use client";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { STRINGS } from "@/lib/strings";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
};

export function SectionHeader({
  title,
  subtitle,
  onSeeAll,
  seeAllLabel = STRINGS.home.seeAll,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-1 flex-col gap-1">
        <Text variant="h2">{title}</Text>
        {subtitle ? <Text variant="body-small">{subtitle}</Text> : null}
      </div>
      {onSeeAll ? (
        <Button
          variant="ghost"
          onClick={onSeeAll}
          aria-label={`${seeAllLabel} ${title}`}
          className="shrink-0 px-3 text-sm text-primary"
        >
          {seeAllLabel}
        </Button>
      ) : null}
    </div>
  );
}
