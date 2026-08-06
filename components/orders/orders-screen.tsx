"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Loader2 } from "lucide-react";
import { OrderCard } from "@/components/orders/order-card";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { Text } from "@/components/ui/text";
import { EmptyState, ErrorState, SkeletonRow } from "@/components/ui/states";
import type { Order } from "@/lib/api/schemas/order";
import {
  useGetPaymentAuthorization,
  useOrdersList,
  useVerifyPayment,
} from "@/lib/api/services/orders";
import { ACTIVE_ORDER_STATUSES } from "@/lib/order-status";
import { STRINGS } from "@/lib/strings";
import { useUserStore } from "@/stores/user";

const ORDER_TABS: { id: string; label: string; statuses?: string[] }[] = [
  {
    id: "active",
    label: STRINGS.orders.tabActive,
    // Must stay the shared constant: identical arguments are what let this
    // screen and the app-wide watcher share one request.
    statuses: [...ACTIVE_ORDER_STATUSES],
  },
  {
    id: "past",
    label: STRINGS.orders.tabPast,
    statuses: ["DELIVERED", "COMPLETED"],
  },
  { id: "cancelled", label: STRINGS.orders.tabCancelled, statuses: ["CANCELLED"] },
];

function GuestView({
  onSignIn,
  onRegister,
}: {
  onSignIn: () => void;
  onRegister: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8">
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary-soft">
          <ClipboardList size={36} className="text-primary" aria-hidden />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <Text variant="h3" className="text-center">
            {STRINGS.orders.guestTitle}
          </Text>
          <Text variant="body-small" className="text-center">
            {STRINGS.orders.guestSubtitle}
          </Text>
        </div>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <Button onClick={onRegister} className="w-full">
          {STRINGS.orders.getStarted}
        </Button>
        <Button variant="outline" onClick={onSignIn} className="w-full text-primary">
          {STRINGS.orders.signIn}
        </Button>
      </div>
    </div>
  );
}

export function OrdersScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const hasHydrated = useUserStore((state) => state.hasHydrated);

  const [activeTab, setActiveTab] = React.useState("active");
  const [pendingActionOrderId, setPendingActionOrderId] = React.useState<
    string | null
  >(null);

  const activeStatuses = ORDER_TABS.find((tab) => tab.id === activeTab)?.statuses;
  const ordersList = useOrdersList(activeStatuses, Boolean(user));
  const orders = ordersList.data ?? [];

  const getAuthorization = useGetPaymentAuthorization();
  const verifyPayment = useVerifyPayment();

  /**
   * "Pay now" re-verifies first: the payment may have completed on Paystack's
   * side without the app hearing about it. Only if it is still unpaid do we ask
   * for a fresh authorization link.
   */
  const handlePayAction = (order: Order) => {
    if (!order.payment_reference) return;
    setPendingActionOrderId(order.id);

    const openAuthorization = () =>
      getAuthorization.mutate(order.id, {
        onSuccess: (authorization) => {
          const params = new URLSearchParams({
            orderId: order.id,
            reference: order.payment_reference ?? "",
            uri: authorization.authorization_url,
          });
          router.push(`/order-payment?${params.toString()}`);
        },
        onError: () => void ordersList.refetch(),
        onSettled: () => setPendingActionOrderId(null),
      });

    verifyPayment.mutate(
      { orderId: order.id, reference: order.payment_reference },
      {
        onSuccess: (verified) => {
          if (verified.payment_status === "PAID") {
            setPendingActionOrderId(null);
            return;
          }
          if (order.status === "PAYMENT_PENDING") openAuthorization();
          else setPendingActionOrderId(null);
        },
        onError: () => {
          if (order.status === "PAYMENT_PENDING") openAuthorization();
          else setPendingActionOrderId(null);
        },
      },
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-3 bg-background px-4 pt-3 pb-3 md:mx-auto md:w-full md:max-w-[1280px] md:px-8 md:pt-8">
        <Text variant="h1">{STRINGS.orders.title}</Text>

        {user ? (
          <div className="scrollbar-none flex gap-2 overflow-x-auto">
            {ORDER_TABS.map((tab) => (
              <FilterChip
                key={tab.id}
                label={tab.label}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="mx-auto w-full max-w-[1280px] flex-1 pb-10 md:px-8">
        {!hasHydrated ? (
          <div className="px-4 md:px-0">
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : !user ? (
          <GuestView
            onSignIn={() => router.push("/auth/signin")}
            onRegister={() => router.push("/auth/register")}
          />
        ) : ordersList.isLoading ? (
          <div className="px-4 md:px-0">
            {[0, 1, 2, 3].map((row) => (
              <SkeletonRow key={row} />
            ))}
          </div>
        ) : ordersList.isError ? (
          <ErrorState
            error={ordersList.error}
            onRetry={() => ordersList.refetch()}
          />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={STRINGS.empty.orders.title}
            action={{
              label: STRINGS.empty.orders.action,
              onClick: () => router.push("/home"),
            }}
          />
        ) : (
          <>
            <ul className="flex flex-col md:gap-3">
              {orders.map((order) => (
                <li key={order.id}>
                  <OrderCard
                    order={order}
                    onOpen={() => router.push(`/order-details/${order.id}`)}
                    onPayAction={() => handlePayAction(order)}
                    isActionPending={pendingActionOrderId === order.id}
                  />
                </li>
              ))}
            </ul>

            {ordersList.hasNextPage ? (
              <div className="flex justify-center py-6">
                <Button
                  variant="outline"
                  onClick={() => ordersList.fetchNextPage()}
                  isLoading={ordersList.isFetchingNextPage}
                >
                  {STRINGS.home.seeAll}
                </Button>
              </div>
            ) : null}

            {ordersList.isFetchingNextPage ? (
              <div className="flex justify-center pb-6">
                <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
