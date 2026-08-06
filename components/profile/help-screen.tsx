"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { ENV } from "@/lib/env";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

export function HelpScreen() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-background px-4 pt-3 pt-safe pb-3 md:px-8">
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
        <Text variant="h3">{STRINGS.help.title}</Text>
      </div>

      <div className="mx-auto flex w-full max-w-[44rem] flex-1 flex-col gap-6 p-4 md:px-8 md:py-8">
        <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-4">
          <div className="flex flex-col gap-1">
            <Text variant="h3">{STRINGS.help.contactTitle}</Text>
            <Text variant="body-small">{STRINGS.help.contactSubtitle}</Text>
          </div>
          <a
            href={`mailto:${ENV.CONTACT_EMAIL}`}
            className={cn(
              "flex min-h-12 items-center gap-3 rounded-card px-1 hover:bg-muted/60",
              focusRing,
            )}
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft">
              <Mail size={18} className="text-primary" aria-hidden />
            </span>
            <span className="flex flex-col">
              <Text as="span" variant="body-strong">
                {STRINGS.help.emailRowLabel}
              </Text>
              <Text as="span" variant="body-small">
                {ENV.CONTACT_EMAIL}
              </Text>
            </span>
          </a>
        </section>

        <section className="flex flex-col gap-3">
          <Text variant="h3">{STRINGS.help.faqTitle}</Text>
          <Accordion
            type="single"
            collapsible
            className="overflow-hidden rounded-card border border-border bg-card"
          >
            {STRINGS.help.faq.map((entry, index) => (
              <AccordionItem key={entry.question} value={`faq-${index}`}>
                <AccordionTrigger className="px-4 text-left font-sans text-base font-bold">
                  {entry.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 font-sans text-base leading-6 text-body">
                  {entry.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}
