"use client";

import * as React from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { AddressSheet } from "@/components/shared/address-sheet";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { useGetAddresses } from "@/lib/api/services/addresses";
import { addressLabel } from "@/lib/address-label";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";
import { resolveSelectedAddress, useAddressStore } from "@/stores/address";
import { useOnboardingStore } from "@/stores/onboarding";
import { useUserStore } from "@/stores/user";

/**
 * The "deliver to" pill. Reads the same resolved address as every other surface
 * (saved address, or the guest's device-local one) and opens the address sheet.
 */
export function LobbyAddressButton({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);

  const user = useUserStore((state) => state.user);
  const { data: backendAddresses = [] } = useGetAddresses({
    enabled: Boolean(user),
  });
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId);
  const localAddress = useAddressStore((state) => state.localAddress);
  const isLocalSelected = useAddressStore((state) => state.isLocalSelected);

  const resolved = resolveSelectedAddress(
    backendAddresses,
    selectedAddressId,
    localAddress,
    isLocalSelected,
  );
  const selectedAddress = resolved?.address ?? null;
  const city = useOnboardingStore((state) => state.city);
  const label = addressLabel(selectedAddress, city, STRINGS.lobby.changeLocation);
  const hasLocation = label !== STRINGS.lobby.changeLocation;

  const trigger = (
    <button
      type="button"
      aria-label={hasLocation ? `${label}. ${STRINGS.lobby.addressHint}` : label}
      className={cn(
        "flex min-h-12 min-w-0 items-center gap-1.5 rounded-full bg-(--header-scrim-top) px-3 py-2",
        "hover:opacity-90 active:opacity-80",
        pressableScale,
        focusRing,
        className,
      )}
    >
      <MapPin size={14} className="shrink-0 text-white/90" aria-hidden />
      <span className="truncate font-sans text-sm font-bold text-white">
        {label}
      </span>
      <ChevronDown size={14} className="shrink-0 text-white/90" aria-hidden />
    </button>
  );

  return <AddressSheet open={open} onOpenChange={setOpen} trigger={trigger} />;
}
