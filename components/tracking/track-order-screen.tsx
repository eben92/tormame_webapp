"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { OrderProgress } from "@/components/orders/order-progress";
import { EmptyArtwork } from "@/components/shared/empty-artwork";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { ApiError } from "@/lib/api/errors";
import type { Order } from "@/lib/api/schemas/order";
import {
  useTrackOrderByContact,
  useTrackOrderByToken,
} from "@/lib/api/services/orders";
import { STRINGS } from "@/lib/strings";
import { orderIdFromTrackingToken } from "@/lib/tracking-token";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user";

/** The code is always six digits — anything longer is a typo, not a code. */
const CODE_MAX_LENGTH = 6;

function TrackHeader({ showBack = false }: { showBack?: boolean }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4 pt-safe md:h-[4.5rem] md:px-8">
      {showBack ? (
        // A link to the landing page rather than `router.back()` or a push:
        // most people arrive here from an email or a bookmark, where "back" is
        // either nothing at all or wherever they happened to be beforehand —
        // for a customer part-way through onboarding, that is onboarding.
        // `replace` keeps the tracking page from stacking up in history.
        <Link
          href="/"
          replace
          aria-label={STRINGS.track.backToHome}
          className={cn(
            "-ml-2 flex size-10 items-center justify-center rounded-full text-foreground",
            pressableScale,
            focusRing,
          )}
        >
          <ArrowLeft size={20} aria-hidden />
        </Link>
      ) : null}
      <Link
        href="/"
        aria-label="TORMAME"
        className={cn("flex shrink-0 items-center gap-2", focusRing)}
      >
        <Image src="/logo.png" alt="" width={28} height={28} className="rounded-lg" />
        <span className="font-sans text-base font-black tracking-widest text-foreground">
          TORMAME
        </span>
      </Link>
    </header>
  );
}

/**
 * Public order tracking. Two ways in, and both land on the same view of the
 * order:
 *
 * - the link in the payment confirmation, which carries a scoped token;
 * - the contact details on the order plus the delivery code, typed in here.
 *
 * Neither needs an account, because most customers here checked out as guests
 * and have none. Only paid orders are trackable; the API enforces that, and the
 * copy says so rather than leaving a dead end unexplained.
 */
export function TrackOrderScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkToken = searchParams.get("token");

  const isSignedIn = Boolean(useUserStore((state) => state.user));
  const hasHydrated = useUserStore((state) => state.hasHydrated);

  const [contact, setContact] = React.useState("");
  const [code, setCode] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);
  /** The order found by the lookup, held so the form can be swapped for it. */
  const [foundOrder, setFoundOrder] = React.useState<Order | null>(null);

  const linkOrderId = orderIdFromTrackingToken(linkToken);
  const linkQuery = useTrackOrderByToken(linkOrderId, linkToken);
  const lookup = useTrackOrderByContact();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedContact = contact.trim();
    const trimmedCode = code.trim();

    if (!trimmedContact) {
      setFormError(STRINGS.track.contactRequired);
      return;
    }
    if (!trimmedCode) {
      setFormError(STRINGS.track.codeRequired);
      return;
    }
    setFormError(null);

    lookup.mutate(
      { contact: trimmedContact, code: trimmedCode },
      {
        onSuccess: (result) => setFoundOrder(result.order),
        onError: (error) => {
          // 429 gets its own sentence: "check your details" is wrong advice
          // when the details were never looked at.
          const isThrottled = error instanceof ApiError && error.status === 429;
          setFormError(
            isThrottled ? STRINGS.track.throttled : STRINGS.track.notFound,
          );
        },
      },
    );
  };

  const resetLookup = () => {
    setFoundOrder(null);
    setFormError(null);
    setContact("");
    setCode("");
    if (linkToken) router.replace("/track");
  };

  // A link that is still loading gets the whole screen: the customer clicked
  // through expecting their order, not a form.
  if (linkToken && linkOrderId && linkQuery.isLoading) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <TrackHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
          <Text variant="body-small">{STRINGS.track.linkOpening}</Text>
        </div>
      </div>
    );
  }

  const linkOrder = linkToken && !linkQuery.isError ? linkQuery.data : null;
  const order = foundOrder ?? linkOrder ?? null;
  // A link that failed drops the customer onto the form rather than a dead end.
  const linkFailed = Boolean(linkToken) && (!linkOrderId || linkQuery.isError);

  if (order) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <TrackHeader showBack />
        <div className="mx-auto flex w-full max-w-[52rem] flex-1 flex-col gap-3 p-4 md:px-8">
          <div className="flex flex-col gap-0.5">
            <Text variant="h1">
              {order.shop_name ?? STRINGS.orderDetails.fallbackShopName}
            </Text>
            {order.branch_name ? (
              <Text variant="body-small">{order.branch_name}</Text>
            ) : null}
          </div>

          <OrderProgress order={order} />

          <div className="mt-2 flex flex-col gap-2 md:flex-row">
            <Button variant="outline" onClick={resetLookup} className="w-full md:w-auto">
              {STRINGS.track.startOver}
            </Button>
            {hasHydrated && isSignedIn ? (
              <Button
                variant="ghost"
                onClick={() => router.push("/orders")}
                className="w-full md:w-auto"
              >
                {STRINGS.track.myOrders}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <TrackHeader showBack />

      <div className="mx-auto flex w-full max-w-[32rem] flex-1 flex-col gap-6 px-4 py-8 md:py-14">
        <div className="flex flex-col items-center gap-3 text-center">
          <EmptyArtwork artKey="search" className="size-28 md:size-32" />
          <Text variant="h1">{STRINGS.track.title}</Text>
          <Text variant="body-small">{STRINGS.track.subtitle}</Text>
        </div>

        {linkFailed ? (
          <p
            role="status"
            className="rounded-card border border-warning/30 bg-warning/10 p-3 text-center font-sans text-sm text-foreground"
          >
            {STRINGS.track.linkExpired}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="track-contact" className="font-sans text-sm font-bold text-foreground">
              {STRINGS.track.contactLabel}
            </label>
            <Input
              id="track-contact"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder={STRINGS.track.contactPlaceholder}
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              enterKeyHint="next"
              aria-invalid={formError === STRINGS.track.contactRequired}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="track-code" className="font-sans text-sm font-bold text-foreground">
              {STRINGS.track.codeLabel}
            </label>
            <Input
              id="track-code"
              value={code}
              // Digits only, and never longer than a code: the numeric keypad
              // comes up on a phone and a mistyped letter cannot be submitted.
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, CODE_MAX_LENGTH))
              }
              placeholder={STRINGS.track.codePlaceholder}
              inputMode="numeric"
              autoComplete="one-time-code"
              enterKeyHint="go"
              className="tracking-[0.3em]"
              aria-invalid={formError === STRINGS.track.codeRequired}
            />
            <Text variant="body-small" className="text-muted-foreground">
              {STRINGS.track.helpBody}
            </Text>
          </div>

          {formError ? (
            <p role="alert" className="font-sans text-sm font-medium text-destructive">
              {formError}
            </p>
          ) : null}

          <Button type="submit" size="lg" isLoading={lookup.isPending} className="w-full">
            {lookup.isPending ? (
              STRINGS.track.searching
            ) : (
              <>
                <Search size={18} aria-hidden />
                {STRINGS.track.submit}
              </>
            )}
          </Button>
        </form>

        {hasHydrated && isSignedIn ? (
          <div className="flex flex-col items-center gap-1 border-t border-border pt-6 text-center">
            <Text variant="body-small">{STRINGS.track.signedInHint}</Text>
            <Link
              href="/orders"
              className={cn(
                "rounded-full px-3 py-1 font-sans text-sm font-bold text-primary",
                focusRing,
              )}
            >
              {STRINGS.track.myOrders}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
