import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Text } from "@/components/ui/text";
import { focusRing } from "@/components/ui/pressable";
import { LEGAL_DOCUMENTS, type LegalDocument } from "@/lib/legal";
import { cn } from "@/lib/utils";

/**
 * One renderer for all three policy pages: they share a voice, a measure and a
 * footer, and duplicating the markup three times would let them drift apart.
 *
 * A Server Component — the text is static, so these pages prerender whole.
 */
export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  const others = LEGAL_DOCUMENTS.filter(
    (entry) => entry.slug !== document.slug,
  );

  return (
    <article className="mx-auto w-full max-w-[46rem] px-4 pt-6 pb-16 md:px-8 md:pt-12">
      <Link
        href="/lobby"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-sans text-sm font-bold text-primary",
          "hover:opacity-80",
          focusRing,
        )}
      >
        <ArrowLeft size={16} aria-hidden />
        Tormame
      </Link>

      <h1 className="mt-4 font-display text-[2rem] leading-tight font-extrabold text-foreground md:text-[2.75rem]">
        {document.title}
      </h1>
      <Text variant="body-small" className="mt-2 text-muted-foreground">
        Last updated {document.updated}
      </Text>

      <div className="mt-6 flex flex-col gap-4">
        {document.intro.map((paragraph) => (
          <Text key={paragraph} className="text-base leading-7">
            {paragraph}
          </Text>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-9">
        {document.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-3">
            <h2 className="font-display text-lg font-extrabold text-foreground md:text-xl">
              {section.heading}
            </h2>
            {section.body?.map((paragraph) => (
              <Text key={paragraph} className="text-base leading-7">
                {paragraph}
              </Text>
            ))}
            {section.bullets ? (
              <ul className="flex list-disc flex-col gap-2 pl-5">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>
                    <Text className="text-base leading-7">{bullet}</Text>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <nav className="mt-12 flex flex-wrap gap-3 border-t border-border pt-6">
        {others.map((entry) => (
          <Link
            key={entry.slug}
            href={`/${entry.slug}`}
            className={cn(
              "rounded-full bg-muted px-4 py-2 font-sans text-sm font-bold text-foreground",
              "hover:opacity-80",
              focusRing,
            )}
          >
            {entry.title}
          </Link>
        ))}
      </nav>
    </article>
  );
}
