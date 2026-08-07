import { CategoryArtwork } from "@/components/lobby/category-artwork";
import { categoryArt } from "@/lib/category-art";
import { ENV } from "@/lib/env";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";
import type { CategoriesGroup } from "@/lib/api/schemas/catalog";

/**
 * The two rows that keep moving on the partners page.
 *
 * Both run on one CSS animation with the track holding the content twice over,
 * so travelling exactly one pass returns it to where it started and the loop
 * has no seam. Motion stops entirely under `prefers-reduced-motion`.
 */

function Lane({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    /* The fades hide the entry and exit rather than letting rows pop in. */
    <div className="relative [mask-image:linear-gradient(to_right,transparent,black_4rem,black_calc(100%-4rem),transparent)]">
      <ul
        className={cn(
          "flex w-max animate-partner-marquee items-center gap-4 md:gap-5",
          className,
        )}
      >
        {children}
      </ul>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-4 text-center font-sans text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase md:px-8">
      {children}
    </h2>
  );
}

/**
 * What people sell, drawn with the same artwork the landing page uses for its
 * category tiles. A shop owner should recognise their own trade in the row, and
 * a burger reads faster than the word "Food".
 */
export function CategoryScroller({ groups }: { groups: CategoriesGroup[] }) {
  const entries = groups
    .filter((group) => Boolean(group.vertical))
    .map((group) => ({
      key: group.vertical,
      label: titleCase(group.vertical),
      art: categoryArt(group.vertical),
    }));

  if (entries.length === 0) return null;

  // Three passes each side so the lane outruns any viewport before repeating.
  const lane = Array.from({ length: 6 }, () => entries).flat();

  return (
    <section className="overflow-hidden border-y border-border bg-card py-10 md:py-14">
      <SectionHeading>{STRINGS.partners.sellTitle}</SectionHeading>
      <div className="mt-7">
        <Lane>
          {lane.map((entry, index) => (
            <li
              key={`${entry.key}-${index}`}
              aria-hidden={index >= entries.length}
              className="flex shrink-0 items-center gap-3 rounded-full border border-border bg-background py-2.5 pr-7 pl-3"
            >
              <span
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full",
                  entry.art.tint,
                )}
              >
                <CategoryArtwork artKey={entry.art.artKey} className="size-9" />
              </span>
              <span className="font-sans text-base font-bold whitespace-nowrap text-foreground">
                {entry.label}
              </span>
            </li>
          ))}
        </Lane>
      </div>
    </section>
  );
}

/**
 * PLACEHOLDER MARKS. These are not real partners.
 *
 * The row is off unless `NEXT_PUBLIC_SHOW_PARTNER_LOGOS` is "true", so nothing
 * here reaches a customer by accident: a wall of logos is a claim about who
 * already trades on the platform. Replace this list with real vendors, or
 * better, read them from the catalogue once enough shops have a logo.
 */
const PLACEHOLDER_LOGOS = [
  { key: "p1", initials: "AB", label: "Partner name" },
  { key: "p2", initials: "CD", label: "Partner name" },
  { key: "p3", initials: "EF", label: "Partner name" },
  { key: "p4", initials: "GH", label: "Partner name" },
  { key: "p5", initials: "JK", label: "Partner name" },
  { key: "p6", initials: "LM", label: "Partner name" },
  { key: "p7", initials: "NP", label: "Partner name" },
  { key: "p8", initials: "QR", label: "Partner name" },
] as const;

export function PartnerLogoScroller() {
  if (!ENV.SHOW_PARTNER_LOGOS) return null;

  const lane = Array.from({ length: 4 }, () => PLACEHOLDER_LOGOS).flat();

  return (
    <section className="overflow-hidden border-b border-border bg-background py-10 md:py-14">
      <SectionHeading>{STRINGS.partners.partnersTitle}</SectionHeading>
      <div className="mt-7">
        <Lane className="gap-6 md:gap-10">
          {lane.map((logo, index) => (
            <li
              key={`${logo.key}-${index}`}
              aria-hidden={index >= PLACEHOLDER_LOGOS.length}
              className="flex shrink-0 items-center gap-3 opacity-60 grayscale"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-muted font-display text-base font-extrabold text-muted-foreground">
                {logo.initials}
              </span>
              <span className="font-display text-lg font-bold whitespace-nowrap text-muted-foreground">
                {logo.label}
              </span>
            </li>
          ))}
        </Lane>
      </div>
    </section>
  );
}

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
