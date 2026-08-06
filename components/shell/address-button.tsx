"use client";

import * as React from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { AddressSheet } from "@/components/shared/address-sheet";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { useGetAddresses } from "@/lib/api/services/addresses";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";
import { resolveSelectedAddress, useAddressStore } from "@/stores/address";
import { useUserStore } from "@/stores/user";

/** The resolved delivery address, shared by every surface that shows one. */
export function useSelectedAddress() {
  const user = useUserStore((state) => state.user);
  const { data: backendAddresses = [] } = useGetAddresses({
    enabled: Boolean(user),
  });
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId);
  const localAddress = useAddressStore((state) => state.localAddress);
  const isLocalSelected = useAddressStore((state) => state.isLocalSelected);

  return (
    resolveSelectedAddress(
      backendAddresses,
      selectedAddressId,
      localAddress,
      isLocalSelected,
    )?.address ?? null
  );
}

/**
 * "Deliver to" control. Stacked (caption over street) inside the mobile home
 * header, inline pill in the desktop header.
 */
export function AddressButton({
  variant = "stacked",
  className,
}: {
  variant?: "stacked" | "pill";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedAddress = useSelectedAddress();

  const label = selectedAddress
    ? `${selectedAddress.street}, ${selectedAddress.city}`
    : STRINGS.home.chooseAddress;

  const ariaLabel = selectedAddress
    ? `${STRINGS.common.deliverTo}: ${label}. ${STRINGS.home.addressHint}`
    : STRINGS.home.chooseAddress;

  const trigger =
    variant === "pill" ? (
      <button
        type="button"
        aria-label={ariaLabel}
        className={cn(
          "flex min-h-12 min-w-0 items-center gap-2 rounded-full border border-border bg-card px-4",
          "hover:bg-muted",
          pressableScale,
          focusRing,
          className,
        )}
      >
        <MapPin size={16} className="shrink-0 text-primary" aria-hidden />
        <span className="truncate font-sans text-sm font-medium text-foreground">
          {label}
        </span>
        <ChevronDown size={16} className="shrink-0 text-primary" aria-hidden />
      </button>
    ) : (
      <button
        type="button"
        aria-label={ariaLabel}
        className={cn(
          "flex min-h-12 w-full items-center gap-2 px-4 pt-3 text-left",
          pressableScale,
          focusRing,
          className,
        )}
      >
        <MapPin size={16} className="shrink-0 text-primary" aria-hidden />
        <span className="flex min-w-0 flex-1 flex-col">
          <Text as="span" variant="caption">
            {STRINGS.common.deliverTo}
          </Text>
          <span className="flex items-center gap-1">
            <Text as="span" variant="h3" className="truncate">
              {label}
            </Text>
            <ChevronDown size={16} className="shrink-0 text-primary" aria-hidden />
          </span>
        </span>
      </button>
    );

  return <AddressSheet open={open} onOpenChange={setOpen} trigger={trigger} />;
}
