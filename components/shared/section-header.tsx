"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { STRINGS } from "@/lib/strings";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  /** Destination for "See all" — an anchor, so the router prefetches it. */
  seeAllHref?: string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
};

export function SectionHeader({
  title,
  subtitle,
  seeAllHref,
  onSeeAll,
  seeAllLabel = STRINGS.home.seeAll,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-1 flex-col gap-1">
        <Text variant="h2">{title}</Text>
        {subtitle ? <Text variant="body-small">{subtitle}</Text> : null}
      </div>
      {seeAllHref ? (
        <Button
          asChild
          variant="ghost"
          className="shrink-0 px-3 text-sm text-primary"
        >
          <Link href={seeAllHref} aria-label={`${seeAllLabel} ${title}`}>
            {seeAllLabel}
          </Link>
        </Button>
      ) : onSeeAll ? (
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
