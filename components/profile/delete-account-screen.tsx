"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/input";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { ApiError } from "@/lib/api/errors";
import {
  useAccountDeletionRequest,
  useCancelAccountDeletion,
  useRequestAccountDeletion,
} from "@/lib/api/services/profile";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user";

/** Whole dates only: the promise is "on this day", not "at this minute". */
function formatDay(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Header() {
  const router = useRouter();
  return (
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
      <Text variant="h3">{STRINGS.deleteAccount.title}</Text>
    </div>
  );
}

/**
 * Account and data deletion, as the Apple and Google store policies require and
 * the privacy policy promises.
 *
 * Nothing is destroyed on tap: the request opens a 30-day window the customer
 * can close again from this same page. The copy is deliberately long — someone
 * deleting their account deserves to know exactly what goes, what has to stay,
 * and how to undo it.
 */
export function DeleteAccountScreen() {
  const router = useRouter();

  const isSignedIn = Boolean(useUserStore((state) => state.user));
  const hasHydrated = useUserStore((state) => state.hasHydrated);

  const [reason, setReason] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const deletionRequest = useAccountDeletionRequest({
    enabled: hasHydrated && isSignedIn,
  });
  const requestDeletion = useRequestAccountDeletion();
  const cancelDeletion = useCancelAccountDeletion();

  const handleConfirm = () => {
    requestDeletion.mutate(
      { reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setReason("");
          toast.success(STRINGS.deleteAccount.requestedToast);
        },
        onError: (error) => {
          setConfirmOpen(false);
          // The server explains a refusal — an account still running a store,
          // say — far better than a generic apology can.
          const message =
            error instanceof ApiError && error.message
              ? error.message
              : STRINGS.deleteAccount.requestErrorToast;
          toast.error(message);
        },
      },
    );
  };

  const handleCancel = () => {
    cancelDeletion.mutate(undefined, {
      onSuccess: () => toast.success(STRINGS.deleteAccount.cancelledToast),
      onError: () => toast.error(STRINGS.deleteAccount.cancelErrorToast),
    });
  };

  if (hasHydrated && !isSignedIn) {
    return (
      <div className="flex flex-1 flex-col">
        <Header />
        <div className="mx-auto flex w-full max-w-[40rem] flex-1 flex-col gap-4 p-4 md:px-8 md:py-8">
          <Text variant="h2">{STRINGS.deleteAccount.signedOutTitle}</Text>
          <Text variant="body">{STRINGS.deleteAccount.signedOutBody}</Text>
          <Button
            size="lg"
            className="md:w-fit"
            onClick={() =>
              router.push("/auth/signin?redirect=%2Fdelete-account&reason=account")
            }
          >
            {STRINGS.orders.signIn}
          </Button>
        </div>
      </div>
    );
  }

  const pending = deletionRequest.data;

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <div className="mx-auto flex w-full max-w-[40rem] flex-1 flex-col gap-6 p-4 pb-10 md:px-8 md:py-8">
        {!hasHydrated || deletionRequest.isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-3/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : pending ? (
          <section className="flex flex-col gap-4 rounded-card border border-warning/30 bg-warning/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-warning"
                aria-hidden
              />
              <div className="flex flex-col gap-1.5">
                <Text variant="h3">{STRINGS.deleteAccount.pendingTitle}</Text>
                <Text variant="body">
                  {STRINGS.deleteAccount.pendingBody(
                    formatDay(pending.scheduled_for),
                  )}
                </Text>
                <Text variant="body-small" className="text-muted-foreground">
                  {STRINGS.deleteAccount.pendingRequestedAt(
                    formatDay(pending.requested_at),
                  )}
                </Text>
              </div>
            </div>
            <Button
              size="lg"
              className="w-full md:w-fit"
              isLoading={cancelDeletion.isPending}
              onClick={handleCancel}
            >
              {cancelDeletion.isPending
                ? STRINGS.deleteAccount.cancelling
                : STRINGS.deleteAccount.cancelCta}
            </Button>
          </section>
        ) : (
          <>
            <Text variant="body">{STRINGS.deleteAccount.intro}</Text>

            <section className="flex flex-col gap-2 rounded-card border border-border bg-card p-4">
              <Text variant="body-strong">
                {STRINGS.deleteAccount.whatHappensTitle}
              </Text>
              <ul className="flex flex-col gap-2">
                {STRINGS.deleteAccount.whatHappens.map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <Check
                      size={16}
                      className="mt-1 shrink-0 text-primary"
                      aria-hidden
                    />
                    <Text variant="body">{line}</Text>
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex flex-col gap-2 rounded-card border border-border bg-card p-4">
              <Text variant="body-strong">
                {STRINGS.deleteAccount.whatStaysTitle}
              </Text>
              <Text variant="body">{STRINGS.deleteAccount.whatStays}</Text>
            </section>

            <section className="flex items-start gap-3 rounded-card border border-primary/20 bg-primary/5 p-4">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-primary"
                aria-hidden
              />
              <div className="flex flex-col gap-1">
                <Text variant="body-strong">
                  {STRINGS.deleteAccount.graceTitle}
                </Text>
                <Text variant="body">{STRINGS.deleteAccount.graceBody}</Text>
              </div>
            </section>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="delete-reason"
                className="font-sans text-sm font-medium text-muted-foreground"
              >
                {STRINGS.deleteAccount.reasonLabel}
              </label>
              <Textarea
                id="delete-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={STRINGS.deleteAccount.reasonPlaceholder}
                rows={3}
                maxLength={500}
              />
            </div>

            <Button
              variant="destructive"
              size="lg"
              className="w-full md:w-fit"
              isLoading={requestDeletion.isPending}
              onClick={() => setConfirmOpen(true)}
            >
              {requestDeletion.isPending
                ? STRINGS.deleteAccount.requesting
                : STRINGS.deleteAccount.requestCta}
            </Button>

            <Text variant="body-small" className="text-muted-foreground">
              {STRINGS.deleteAccount.helpNote}{" "}
              <Link
                href="/help"
                className={cn(
                  "rounded-full font-bold text-primary underline-offset-4 hover:underline",
                  focusRing,
                )}
              >
                {STRINGS.help.title}
              </Link>
            </Text>
          </>
        )}
      </div>

      <ResponsiveSheet
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={STRINGS.deleteAccount.confirmTitle}
        description={STRINGS.deleteAccount.confirmBody}
      >
        <div className="flex flex-col gap-3 px-5 pt-2 pb-6">
          <Button
            variant="destructive"
            size="lg"
            isLoading={requestDeletion.isPending}
            onClick={handleConfirm}
          >
            {requestDeletion.isPending
              ? STRINGS.deleteAccount.requesting
              : STRINGS.deleteAccount.confirmCta}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setConfirmOpen(false)}
          >
            {STRINGS.deleteAccount.keepCta}
          </Button>
        </div>
      </ResponsiveSheet>
    </div>
  );
}
