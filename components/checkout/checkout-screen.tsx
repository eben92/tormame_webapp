"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AddressSheet } from "@/components/shared/address-sheet";
import { BranchSheet } from "@/components/checkout/branch-sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterChip } from "@/components/ui/filter-chip";
import { Input } from "@/components/ui/input";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { EmptyState } from "@/components/ui/states";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { useGetAddresses } from "@/lib/api/services/addresses";
import { useGetBranches } from "@/lib/api/services/branches";
import { useGetPublicCompany } from "@/lib/api/services/companies";
import { useCreateOrder } from "@/lib/api/services/orders";
import { isBranchInCity, pickDefaultBranch } from "@/lib/branch";
import { STRINGS } from "@/lib/strings";
import { cn, formatCedis } from "@/lib/utils";
import { resolveSelectedAddress, useAddressStore } from "@/stores/address";
import { parsePrice, useCartStore, type CartItem } from "@/stores/cart";
import {
  DROPOFF_INSTRUCTION_OPTIONS,
  useCheckoutStore,
} from "@/stores/checkout";
import { useOnboardingStore } from "@/stores/onboarding";
import type { FulfillmentType } from "@/lib/api/schemas/order";

const SERVICE_FEE_RATE = 0.02;
const MIN_SERVICE_FEE = 1;

function ItemThumbnail({
  imageUrl,
  size,
}: {
  imageUrl?: string;
  size: number;
}) {
  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-image bg-muted"
      style={{ width: size, height: size }}
    >
      <Image
        src={imageUrl || "/auth.webp"}
        alt=""
        fill
        sizes={`${size}px`}
        className="object-cover"
      />
    </span>
  );
}

function CheckoutItemRow({
  item,
  indented = false,
}: {
  item: CartItem;
  indented?: boolean;
}) {
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const label = item.variantLabel ? `${item.name} · ${item.variantLabel}` : item.name;
  const lineTotal = formatCedis(parsePrice(item.price) * item.quantity);
  const removeLabel = STRINGS.checkout.removeItem(label);

  // decrementItem removes the line entirely once quantity hits 1, so both paths
  // surface the same "removed" feedback.
  const handleDecrement = () => {
    decrementItem(item.id);
    if (item.quantity === 1) toast(STRINGS.checkout.removedFromBasket(label));
  };

  const handleRemove = () => {
    removeItem(item.id);
    toast(STRINGS.checkout.removedFromBasket(label));
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 py-3",
        indented ? "border-t border-border/50 pl-3" : "border-b border-border/50",
      )}
    >
      <div className="flex items-center gap-3">
        {indented ? (
          <span className="w-0.5 self-stretch rounded-full bg-primary/40" />
        ) : null}
        <ItemThumbnail imageUrl={item.imageUrl} size={indented ? 40 : 48} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Text variant="body-strong" className="line-clamp-2">
            {label}
          </Text>
          {item.modifierSummary ? (
            <Text
              variant="body-small"
              className="line-clamp-2 text-muted-foreground"
            >
              {item.modifierSummary}
            </Text>
          ) : null}
          <Text variant="body-strong" className="text-primary">
            {lineTotal}
          </Text>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleRemove}
          aria-label={removeLabel}
          className={cn(
            "flex size-12 items-center justify-center rounded-full text-destructive",
            "active:bg-destructive/10 hover:bg-destructive/10",
            pressableScale,
            focusRing,
          )}
        >
          <Trash2 size={18} aria-hidden />
        </button>
        <QuantityStepper
          quantity={item.quantity}
          onIncrement={() => incrementItem(item.id)}
          onDecrement={handleDecrement}
          min={0}
          decrementAtBoundaryLabel={removeLabel}
        />
      </div>
    </div>
  );
}

function FulfillmentToggle({
  value,
  onChange,
}: {
  value: FulfillmentType;
  onChange: (value: FulfillmentType) => void;
}) {
  return (
    <div className="flex gap-2 rounded-full bg-muted p-1">
      {(["DELIVERY", "PICKUP"] as const).map((option) => {
        const isActive = value === option;
        const label =
          option === "DELIVERY"
            ? STRINGS.checkout.fulfillmentDelivery
            : STRINGS.checkout.fulfillmentPickup;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={isActive}
            className={cn(
              "flex min-h-12 flex-1 items-center justify-center rounded-full font-sans text-base font-bold",
              pressableScale,
              focusRing,
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <Text variant={emphasis ? "h3" : "body"}>{label}</Text>
      <Text variant={emphasis ? "h3" : "body-strong"}>{value}</Text>
    </div>
  );
}

export function CheckoutScreen() {
  const router = useRouter();

  const cartItems = useCartStore((state) => state.items);
  const cartStoreId = useCartStore((state) => state.storeId);
  const clearCart = useCartStore((state) => state.clearCart);
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  const fulfillmentType = useCheckoutStore((state) => state.fulfillmentType);
  const setFulfillmentType = useCheckoutStore((state) => state.setFulfillmentType);
  const dropoffInstruction = useCheckoutStore((state) => state.dropoffInstruction);
  const setDropoffInstruction = useCheckoutStore(
    (state) => state.setDropoffInstruction,
  );
  const customInstruction = useCheckoutStore((state) => state.customInstruction);
  const setCustomInstruction = useCheckoutStore(
    (state) => state.setCustomInstruction,
  );
  const noChangeAcknowledged = useCheckoutStore(
    (state) => state.noChangeAcknowledged,
  );
  const toggleNoChangeAcknowledged = useCheckoutStore(
    (state) => state.toggleNoChangeAcknowledged,
  );
  const selectedBranchId = useCheckoutStore((state) => state.selectedBranchId);
  const branchPickedExplicitly = useCheckoutStore(
    (state) => state.branchPickedExplicitly,
  );
  const setDefaultBranch = useCheckoutStore((state) => state.setDefaultBranch);

  const [addressSheetOpen, setAddressSheetOpen] = React.useState(false);
  const [branchSheetOpen, setBranchSheetOpen] = React.useState(false);

  const { data: backendAddresses = [] } = useGetAddresses();
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId);
  const localAddress = useAddressStore((state) => state.localAddress);
  const isLocalSelected = useAddressStore((state) => state.isLocalSelected);
  const onboardingCity = useOnboardingStore((state) => state.city);

  const branchesQuery = useGetBranches(cartStoreId);
  const branches = React.useMemo(
    () => branchesQuery.data ?? [],
    [branchesQuery.data],
  );

  const createOrder = useCreateOrder();

  const hasDigitalItem = cartItems.some((item) => item.isDigital);
  const showDeliveryOptions = !hasDigitalItem;
  const isDelivery = showDeliveryOptions && fulfillmentType === "DELIVERY";

  const resolvedAddress = resolveSelectedAddress(
    backendAddresses,
    selectedAddressId,
    localAddress,
    isLocalSelected,
  );
  const selectedAddress = resolvedAddress?.address ?? null;

  // Delivery lands at the address, so the address's city decides which branch
  // prepares it. Pickup has no address — the customer's own city is the signal.
  const contextCity = isDelivery
    ? (selectedAddress?.city ?? null)
    : onboardingCity;
  const storeDetails = useGetPublicCompany(cartStoreId ?? "", contextCity).data;
  const selectedBranch =
    branches.find((branch) => branch.id === selectedBranchId) ?? null;

  const hasBranchChoice = branches.length > 1;
  const showBranchCard =
    branchesQuery.isLoading || branchesQuery.isError || hasBranchChoice;

  // Re-evaluated on context *changes* only: without this an explicit pick would
  // be overwritten on the next render and snap back under the customer's finger.
  const lastContextCityRef = React.useRef<string | null | undefined>(undefined);
  React.useEffect(() => {
    if (branches.length === 0) return;

    const contextChanged = lastContextCityRef.current !== contextCity;
    lastContextCityRef.current = contextCity;

    if (!selectedBranchId) {
      const next = pickDefaultBranch(branches, contextCity);
      if (next) setDefaultBranch(next.id);
      return;
    }
    if (!contextChanged) return;
    // A deliberate pick survives only while it still serves the new city.
    if (
      branchPickedExplicitly &&
      selectedBranch &&
      isBranchInCity(selectedBranch, contextCity)
    ) {
      return;
    }
    const next = pickDefaultBranch(branches, contextCity);
    if (next && next.id !== selectedBranchId) setDefaultBranch(next.id);
  }, [
    branches,
    contextCity,
    selectedBranch,
    selectedBranchId,
    branchPickedExplicitly,
    setDefaultBranch,
  ]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0,
  );
  const serviceFee =
    subtotal > 0 ? Math.max(subtotal * SERVICE_FEE_RATE, MIN_SERVICE_FEE) : 0;
  const resolvedDeliveryFee =
    storeDetails?.delivery_fee ?? storeDetails?.min_delivery_fee ?? 0;
  const deliveryFee = isDelivery ? resolvedDeliveryFee : 0;
  const total = subtotal + serviceFee + deliveryFee;

  const canPlaceOrder =
    cartItems.length > 0 &&
    !createOrder.isPending &&
    !branchesQuery.isLoading &&
    !branchesQuery.isError &&
    (!hasBranchChoice || selectedBranchId !== null) &&
    (!isDelivery || (selectedAddress !== null && noChangeAcknowledged));

  // Lines from the same product sit together, with the extra packages indented
  // under the first.
  const cartGroups = React.useMemo(() => {
    const map = new Map<string, CartItem[]>();
    cartItems.forEach((item) => {
      const existing = map.get(item.productId);
      if (existing) existing.push(item);
      else map.set(item.productId, [item]);
    });
    return Array.from(map.entries());
  }, [cartItems]);

  const handlePlaceOrder = () => {
    // The CTA stays enabled so it can name the unmet requirement rather than
    // silently swallowing the tap.
    if (!canPlaceOrder) {
      if (branchesQuery.isError) {
        toast.error(STRINGS.checkout.branchLoadFailed);
        return;
      }
      if (branchesQuery.isLoading || (hasBranchChoice && !selectedBranchId)) {
        toast.error(STRINGS.checkout.missingBranchToast);
        return;
      }
      if (isDelivery && !selectedAddress) {
        toast.error(STRINGS.checkout.missingAddressToast);
      } else if (isDelivery && !noChangeAcknowledged) {
        toast.error(STRINGS.checkout.missingConsentToast);
      }
      return;
    }
    if (!cartStoreId) return;

    createOrder.mutate(
      {
        company_id: cartStoreId,
        fulfillment_type: fulfillmentType,
        branch_id: selectedBranchId ?? undefined,
        address_id:
          isDelivery && resolvedAddress?.source === "saved"
            ? resolvedAddress.address.id
            : undefined,
        new_address:
          isDelivery && resolvedAddress?.source === "local"
            ? resolvedAddress.address
            : undefined,
        items: cartItems.map((item) => ({
          product_id: item.productId,
          product_variant_id: item.variantId,
          quantity: item.quantity,
          modifier_option_ids: item.modifierOptionIds?.length
            ? item.modifierOptionIds
            : undefined,
        })),
        note: customInstruction || dropoffInstruction || undefined,
      },
      {
        onSuccess: (placement) => {
          clearCart();
          const params = new URLSearchParams({
            orderId: placement.order.id,
            reference: placement.order.payment_reference ?? "",
          });
          if (placement.authorization_url) {
            params.append("uri", placement.authorization_url);
          }
          router.replace(`/order-payment?${params.toString()}`);
        },
      },
    );
  };

  if (hasHydrated && cartItems.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col">
        <EmptyState
          icon={ShoppingBag}
          title={STRINGS.empty.cart.title}
          action={{
            label: STRINGS.empty.cart.action,
            onClick: () => router.push("/explore"),
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-background px-4 pt-3 pb-3 md:hidden">
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
        <Text variant="h3">{STRINGS.checkout.title}</Text>
      </div>

      <div className="mx-auto grid w-full max-w-[1280px] flex-1 gap-8 pb-32 md:grid-cols-[1fr_22rem] md:px-8 md:py-8 md:pb-8">
        <div className="flex flex-col">
          <Text variant="h1" className="hidden px-4 pb-4 md:block md:px-0">
            {STRINGS.checkout.title}
          </Text>

          {showDeliveryOptions ? (
            <div className="px-4 pt-5 md:px-0 md:pt-0">
              <FulfillmentToggle
                value={fulfillmentType}
                onChange={setFulfillmentType}
              />
            </div>
          ) : null}

          {showBranchCard ? (
            <div className="mx-4 mt-6 flex flex-col gap-2 rounded-card border border-border bg-card p-4 md:mx-0">
              <Text variant="caption">
                {isDelivery
                  ? STRINGS.checkout.fulfilledByTitle
                  : STRINGS.checkout.pickupFromTitle}
              </Text>
              {branchesQuery.isLoading ? (
                <div className="flex flex-col gap-2 py-1">
                  <Skeleton className="h-4 w-2/5" />
                  <Skeleton className="h-3 w-3/5" />
                </div>
              ) : branchesQuery.isError ? (
                <button
                  type="button"
                  onClick={() => branchesQuery.refetch()}
                  className={cn(
                    "flex min-h-12 items-center justify-between",
                    focusRing,
                  )}
                >
                  <Text variant="body-small" className="flex-1 pr-3 text-muted-foreground">
                    {STRINGS.checkout.branchLoadFailed}
                  </Text>
                  <Text variant="body-strong" className="text-primary">
                    {STRINGS.checkout.retry}
                  </Text>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setBranchSheetOpen(true)}
                  aria-label={STRINGS.checkout.changeBranchLabel}
                  className={cn(
                    "flex min-h-12 items-center justify-between text-left",
                    focusRing,
                  )}
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 pr-3">
                    <Text as="span" variant="body-strong">
                      {selectedBranch?.name ?? ""}
                    </Text>
                    <Text
                      as="span"
                      variant="body-small"
                      className="truncate text-muted-foreground"
                    >
                      {isDelivery
                        ? (selectedBranch?.city ?? "")
                        : (selectedBranch?.formatted_address ||
                          selectedBranch?.city ||
                          "")}
                    </Text>
                  </span>
                  <Text as="span" variant="body-strong" className="text-primary">
                    {STRINGS.checkout.changeBranch}
                  </Text>
                </button>
              )}
            </div>
          ) : null}

          {isDelivery ? (
            <div className="mx-4 mt-6 flex flex-col gap-2 rounded-card border border-border bg-card p-4 md:mx-0">
              <Text variant="caption">{STRINGS.common.deliverTo}</Text>
              <button
                type="button"
                onClick={() => setAddressSheetOpen(true)}
                aria-label={
                  selectedAddress
                    ? STRINGS.checkout.changeAddressLabel
                    : STRINGS.checkout.addAddress
                }
                className={cn(
                  "flex min-h-12 items-center justify-between text-left",
                  focusRing,
                )}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 pr-3">
                  {selectedAddress ? (
                    <>
                      <Text as="span" variant="body-strong">
                        {selectedAddress.street}
                      </Text>
                      <Text
                        as="span"
                        variant="body-small"
                        className="truncate text-muted-foreground"
                      >
                        {[selectedAddress.city, selectedAddress.landmark]
                          .filter(Boolean)
                          .join(" · ")}
                      </Text>
                    </>
                  ) : (
                    <Text as="span" variant="body-strong">
                      {STRINGS.checkout.addAddress}
                    </Text>
                  )}
                </span>
                <Text as="span" variant="body-strong" className="text-primary">
                  {STRINGS.checkout.changeAddress}
                </Text>
              </button>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-1 px-4 md:px-0">
            <Text variant="caption">{STRINGS.checkout.orderItemsTitle}</Text>
            {cartGroups.map(([productId, items]) => (
              <div key={productId}>
                {items.length > 1 ? (
                  <div className="flex items-center gap-3 py-3">
                    <ItemThumbnail imageUrl={items[0].parentImageUrl} size={40} />
                    <Text variant="body-strong" className="line-clamp-2 flex-1">
                      {items[0].parentName}
                    </Text>
                  </div>
                ) : null}
                {items.map((item) => (
                  <CheckoutItemRow
                    key={item.id}
                    item={item}
                    indented={items.length > 1}
                  />
                ))}
              </div>
            ))}
          </div>

          {isDelivery ? (
            <div className="mt-6 flex flex-col gap-3 px-4 md:px-0">
              <Text variant="caption">
                {STRINGS.checkout.dropoffInstructionsTitle}
              </Text>
              <div className="flex flex-wrap gap-2">
                {DROPOFF_INSTRUCTION_OPTIONS.map((option) => (
                  <FilterChip
                    key={option}
                    label={option}
                    isActive={dropoffInstruction === option}
                    onClick={() =>
                      setDropoffInstruction(
                        dropoffInstruction === option ? null : option,
                      )
                    }
                  />
                ))}
              </div>
              <Input
                value={customInstruction}
                onChange={(event) => setCustomInstruction(event.target.value)}
                placeholder={STRINGS.checkout.customNotePlaceholder}
                aria-label={STRINGS.checkout.customNotePlaceholder}
              />
            </div>
          ) : null}
        </div>

        <aside className="flex flex-col gap-4 px-4 md:sticky md:top-[6.5rem] md:h-fit md:rounded-card md:border md:border-border md:bg-card md:p-6 md:px-6">
          <div className="mt-6 flex flex-col gap-2 md:mt-0">
            <Text variant="caption">{STRINGS.checkout.costBreakdownTitle}</Text>
            <SummaryRow
              label={STRINGS.checkout.subtotal}
              value={formatCedis(subtotal)}
            />
            <SummaryRow
              label={STRINGS.checkout.serviceFee}
              value={formatCedis(serviceFee)}
            />
            {isDelivery ? (
              <SummaryRow
                label={STRINGS.checkout.deliveryFee}
                value={formatCedis(deliveryFee)}
              />
            ) : null}
            <div className="mt-1 border-t border-border pt-2">
              <SummaryRow
                label={STRINGS.checkout.total}
                value={formatCedis(total)}
                emphasis
              />
            </div>
          </div>

          {isDelivery ? (
            <label className="flex min-h-12 cursor-pointer items-center gap-3">
              <Checkbox
                checked={noChangeAcknowledged}
                onCheckedChange={toggleNoChangeAcknowledged}
              />
              <Text as="span" variant="body-small" className="flex-1">
                {STRINGS.checkout.noChangeAcknowledgement}
              </Text>
            </label>
          ) : null}

          <div className="hidden md:block">
            <Button
              size="lg"
              className="w-full"
              dimmed={!canPlaceOrder}
              isLoading={createOrder.isPending}
              onClick={handlePlaceOrder}
            >
              <span className="truncate">
                {createOrder.isPending
                  ? STRINGS.checkout.placingOrder
                  : STRINGS.checkout.placeOrder(formatCedis(total))}
              </span>
            </Button>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background px-4 pt-3 pb-4 pb-safe md:hidden">
        <Button
          size="lg"
          className="w-full"
          dimmed={!canPlaceOrder}
          isLoading={createOrder.isPending}
          onClick={handlePlaceOrder}
        >
          <span className="truncate">
            {createOrder.isPending
              ? STRINGS.checkout.placingOrder
              : STRINGS.checkout.placeOrder(formatCedis(total))}
          </span>
        </Button>
      </div>

      <AddressSheet open={addressSheetOpen} onOpenChange={setAddressSheetOpen} />
      <BranchSheet
        companyId={cartStoreId}
        open={branchSheetOpen}
        onOpenChange={setBranchSheetOpen}
      />
    </div>
  );
}
