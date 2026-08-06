"use client";

import * as React from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { ErrorState } from "@/components/ui/states";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import type {
  ProductDetail,
  ProductModifierGroup,
  ProductVariant,
} from "@/lib/api/schemas/product";
import { useGetProductDetail } from "@/lib/api/services/products";
import { STRINGS } from "@/lib/strings";
import { cn, formatCedis } from "@/lib/utils";
import { packageKey, useCartStore, type CartItemInput } from "@/stores/cart";
import { useCheckoutStore } from "@/stores/checkout";

/** Caption label + stacked selectable rows. */
function OptionGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Text variant="caption">{label}</Text>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

/**
 * One variant/modifier option: the whole row is the target, primary-soft when
 * selected, with a trailing check as the recognition cue.
 */
function SelectableRow({
  label,
  priceLabel,
  isFree,
  isSelected,
  role,
  onSelect,
}: {
  label: string;
  priceLabel: string;
  isFree: boolean;
  isSelected: boolean;
  role: "radio" | "checkbox";
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={isSelected}
      onClick={onSelect}
      className={cn(
        "flex min-h-12 w-full items-center gap-3 rounded-card px-4 py-3 text-left",
        pressableScale,
        focusRing,
        isSelected ? "bg-primary-soft" : "hover:bg-muted",
      )}
    >
      <Text
        as="span"
        variant="body"
        className={cn("flex-1", isSelected && "text-primary")}
      >
        {label}
      </Text>
      <Text
        as="span"
        variant="body-strong"
        className={
          isFree
            ? "text-muted-foreground"
            : isSelected
              ? "text-primary"
              : "text-foreground"
        }
      >
        {priceLabel}
      </Text>
      {isSelected ? (
        <Check size={18} className="text-primary" aria-hidden />
      ) : null}
    </button>
  );
}

function VariantSection({
  variants,
  selectedId,
  basePriceSet,
  onSelect,
}: {
  variants: ProductVariant[];
  selectedId: string | null;
  basePriceSet: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <OptionGroup
      label={`${STRINGS.product.chooseOption} (${STRINGS.product.required})`}
    >
      {variants.map((variant) => (
        <SelectableRow
          key={variant.id}
          label={variant.name}
          priceLabel={
            basePriceSet
              ? `+${formatCedis(variant.price)}`
              : formatCedis(variant.price)
          }
          isFree={variant.price === 0}
          isSelected={selectedId === variant.id}
          role="radio"
          onSelect={() => onSelect(variant.id)}
        />
      ))}
    </OptionGroup>
  );
}

function ModifierSection({
  group,
  selection,
  onToggle,
}: {
  group: ProductModifierGroup;
  selection: number[];
  onToggle: (optionId: number) => void;
}) {
  const isMultiSelect = group.max_select > 1;
  const label = group.is_required
    ? `${group.name} (${STRINGS.product.required})`
    : isMultiSelect
      ? `${group.name} (${STRINGS.product.maxSelect(group.max_select)})`
      : group.name;

  return (
    <OptionGroup label={label}>
      {group.options.map((option) => (
        <SelectableRow
          key={option.id}
          label={option.name}
          priceLabel={`+${formatCedis(option.price)}`}
          isFree={option.price === 0}
          isSelected={selection.includes(option.id)}
          role={isMultiSelect ? "checkbox" : "radio"}
          onSelect={() => onToggle(option.id)}
        />
      ))}
    </OptionGroup>
  );
}

/**
 * Loader shown while the product-detail query is in flight. Deliberately omits
 * option-row placeholders: the product's shape isn't known yet, so this shows
 * only what every product has.
 */
function VariantSheetSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-5 pt-1 pb-8">
      <Skeleton className="h-48 w-full rounded-image" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-3/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/5" />
      </div>
    </div>
  );
}

export type VariantSheetTarget = { productId: string; storeId: string } | null;

type VariantSelectorSheetProps = {
  target: VariantSheetTarget;
  onClose: () => void;
};

/**
 * Product configurator: variants, modifier groups, quantity and the add-to-basket
 * CTA. Opens as a bottom sheet on mobile and a dialog on desktop.
 */
export function VariantSelectorSheet({
  target,
  onClose,
}: VariantSelectorSheetProps) {
  const productQuery = useGetProductDetail(target?.productId ?? null);
  const product = productQuery.data ?? null;

  return (
    <ResponsiveSheet
      open={Boolean(target)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      /* Accessible name only — the product's own name is the visible heading in
         the body, so repeating it here would announce it twice. */
      title={STRINGS.product.chooseOption}
      hideTitle
      className="md:max-w-[34rem]"
    >
      {target ? (
        <VariantSheetBody
          key={target.productId}
          product={product}
          isLoading={productQuery.isLoading}
          isError={productQuery.isError}
          error={productQuery.error}
          onRetry={() => productQuery.refetch()}
          storeId={target.storeId}
          onClose={onClose}
        />
      ) : null}
    </ResponsiveSheet>
  );
}

function VariantSheetBody({
  product,
  isLoading,
  isError,
  error,
  onRetry,
  storeId,
  onClose,
}: {
  product: ProductDetail | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  storeId: string;
  onClose: () => void;
}) {
  const addPackage = useCartStore((state) => state.addPackage);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartStoreId = useCartStore((state) => state.storeId);
  const resetCheckout = useCheckoutStore((state) => state.reset);

  const isDefaultOnlyVariant =
    product?.variants.length === 1 &&
    product.variants[0].name.toLowerCase() === "default";

  const [selectedVariantId, setSelectedVariantId] = React.useState<string | null>(
    isDefaultOnlyVariant ? (product?.variants[0].id ?? null) : null,
  );
  const [selection, setSelection] = React.useState<Record<number, number[]>>({});
  const [quantity, setQuantity] = React.useState(1);
  const [confirmClearOpen, setConfirmClearOpen] = React.useState(false);

  // The default-only variant is synthetic: it is the product's only price, so it
  // is preselected the moment the product resolves.
  const defaultVariantId = isDefaultOnlyVariant
    ? (product?.variants[0].id ?? null)
    : null;
  const effectiveVariantId = selectedVariantId ?? defaultVariantId;

  const imageUrl = product?.images?.[0]?.url;
  const basePrice = product?.base_price ?? 0;
  const selectedVariant = product?.variants.find(
    (variant) => variant.id === effectiveVariantId,
  );
  const variantPrice = selectedVariant?.price ?? 0;

  const modifierTotal = (product?.modifier_groups ?? [])
    .flatMap((group) =>
      (selection[group.id] ?? []).map(
        (optionId) =>
          group.options.find((option) => option.id === optionId)?.price ?? 0,
      ),
    )
    .reduce((sum, price) => sum + price, 0);

  const unitPrice = basePrice + variantPrice + modifierTotal;
  const sessionTotal = unitPrice * quantity;

  const isValid = Boolean(
    product &&
      (product.variants.length === 0 || effectiveVariantId !== null) &&
      product.modifier_groups.every(
        (group) =>
          !group.is_required ||
          (selection[group.id]?.length ?? 0) >= Math.max(group.min_select, 1),
      ),
  );

  // Mirrors `isValid`'s order (variant first, then groups in list order) so the
  // toast always names the group a shopper must fix first.
  const firstMissingGroupLabel = (() => {
    if (!product) return null;
    if (product.variants.length > 0 && effectiveVariantId === null) {
      return "an option";
    }
    return (
      product.modifier_groups.find(
        (group) =>
          group.is_required &&
          (selection[group.id]?.length ?? 0) < Math.max(group.min_select, 1),
      )?.name ?? null
    );
  })();

  const handleToggle = (
    groupId: number,
    optionId: number,
    maxSelect: number,
  ) => {
    setSelection((previous) => {
      const current = previous[groupId] ?? [];
      if (current.includes(optionId)) {
        return {
          ...previous,
          [groupId]: current.filter((id) => id !== optionId),
        };
      }
      if (maxSelect === 1) return { ...previous, [groupId]: [optionId] };
      if (current.length >= maxSelect) return previous;
      return { ...previous, [groupId]: [...current, optionId] };
    });
  };

  const addToCart = () => {
    if (!product || !isValid) return;

    const selectedModifiers = product.modifier_groups.flatMap((group) =>
      (selection[group.id] ?? []).map((optionId) => ({
        id: optionId,
        groupName: group.name,
        optionName:
          group.options.find((option) => option.id === optionId)?.name ?? "",
      })),
    );
    const modifierOptionIds = selectedModifiers.map((modifier) => modifier.id);

    const input: CartItemInput = {
      id: packageKey(
        product.id,
        effectiveVariantId ?? undefined,
        modifierOptionIds.length ? modifierOptionIds : undefined,
      ),
      productId: product.id,
      variantId: effectiveVariantId ?? undefined,
      parentName: product.name,
      parentImageUrl: imageUrl,
      variantLabel: selectedVariant?.name,
      name: product.name,
      price: formatCedis(unitPrice),
      imageUrl,
      isDigital: product.is_digital,
      modifierOptionIds: modifierOptionIds.length ? modifierOptionIds : undefined,
      modifierSummary:
        selectedModifiers.length > 0
          ? selectedModifiers
              .map((modifier) => `${modifier.groupName}: ${modifier.optionName}`)
              .join(" · ")
          : undefined,
    };

    addPackage(storeId, input, quantity);
    onClose();
  };

  const handleAddClick = () => {
    if (!isValid) {
      if (firstMissingGroupLabel) {
        toast.error(STRINGS.product.chooseGroupFirst(firstMissingGroupLabel));
      }
      return;
    }
    // A basket belongs to one store; adding from another needs confirmation.
    if (cartStoreId && cartStoreId !== storeId) {
      setConfirmClearOpen(true);
      return;
    }
    addToCart();
  };

  if (isLoading) return <VariantSheetSkeleton />;

  if (isError) {
    return (
      <div className="flex min-h-64 flex-col px-5 pb-8">
        <ErrorState error={error} onRetry={onRetry} />
      </div>
    );
  }

  if (!product) return null;

  return (
    <>
      <div className="flex max-h-[60vh] flex-col gap-6 overflow-y-auto px-5 pt-1 pb-6 md:max-h-[55vh]">
        <div className="relative h-50 w-full overflow-hidden rounded-image bg-muted">
          <Image
            src={imageUrl || "/auth.webp"}
            alt=""
            fill
            sizes="(min-width: 768px) 540px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Text variant="h2">{product.name}</Text>
          {product.description ? (
            <Text variant="body">{product.description}</Text>
          ) : null}
          {product.allergens ? (
            <Text variant="body-small" className="text-warning">
              {STRINGS.product.allergensLabel(product.allergens)}
            </Text>
          ) : null}
          <Text variant="body-strong" className="text-primary">
            {formatCedis(unitPrice)}
          </Text>
        </div>

        {product.variants.length > 0 && !isDefaultOnlyVariant ? (
          <VariantSection
            variants={product.variants}
            selectedId={effectiveVariantId}
            basePriceSet={product.base_price != null}
            onSelect={setSelectedVariantId}
          />
        ) : null}

        {product.modifier_groups.map((group) => (
          <ModifierSection
            key={group.id}
            group={group}
            selection={selection[group.id] ?? []}
            onToggle={(optionId) =>
              handleToggle(group.id, optionId, group.max_select)
            }
          />
        ))}
      </div>

      <div className="flex items-center gap-3 border-t border-border bg-card px-4 pt-4 pb-4 pb-safe">
        <QuantityStepper
          quantity={quantity}
          onIncrement={() => setQuantity((value) => value + 1)}
          onDecrement={() => setQuantity((value) => Math.max(1, value - 1))}
        />
        <Button
          size="lg"
          className="min-w-0 flex-1 px-4"
          dimmed={!isValid}
          onClick={handleAddClick}
        >
          <span className="truncate">
            {STRINGS.product.addToBasket(formatCedis(sessionTotal))}
          </span>
        </Button>
      </div>

      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{STRINGS.shop.clearBasketTitle}</DialogTitle>
            <DialogDescription>
              {STRINGS.shop.clearBasketMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setConfirmClearOpen(false)}
            >
              {STRINGS.common.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearCart();
                resetCheckout();
                setConfirmClearOpen(false);
                addToCart();
              }}
            >
              {STRINGS.shop.clearBasketConfirm}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
