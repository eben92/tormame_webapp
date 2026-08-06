import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentVerificationScreen } from "@/components/payment/payment-verification-screen";
import { Skeleton } from "@/components/ui/skeleton";
import { STRINGS } from "@/lib/strings";

export const metadata: Metadata = {
  title: STRINGS.paymentVerification.documentTitle,
  // A receipt for one customer's payment: never indexed, never followed.
  robots: { index: false, follow: false },
};

function VerificationSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-[26rem] flex-col items-center gap-4 rounded-card border border-border bg-card p-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}

/**
 * Paystack returns customers here with `?reference=…` (and its own `trxref`,
 * which we ignore — they carry the same value).
 *
 * The reference is URL data, so it is read inside the boundary and the shell
 * ships without it.
 */
async function Verification({
  searchParams,
}: Pick<PageProps<"/payment-redirect">, "searchParams">) {
  const params = await searchParams;
  const raw = params.reference ?? params.trxref;
  const reference = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");

  return <PaymentVerificationScreen reference={reference} />;
}

export default function PaymentRedirectPage({
  searchParams,
}: PageProps<"/payment-redirect">) {
  return (
    <Suspense fallback={<VerificationSkeleton />}>
      <Verification searchParams={searchParams} />
    </Suspense>
  );
}
