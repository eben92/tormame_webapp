"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ChevronDown, ChevronLeft, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { CityRowList } from "@/components/shared/city-row-list";
import { useCreateAddress, useGetAddresses } from "@/lib/api/services/addresses";
import type { Address, LocalAddress } from "@/lib/api/schemas/account";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";
import { useAddressStore } from "@/stores/address";
import { useOnboardingStore } from "@/stores/onboarding";
import { useUserStore } from "@/stores/user";

const DEFAULT_REGION = "Eastern Region";
const DEFAULT_COUNTRY = "Ghana";

type ListEntry =
  | { kind: "saved"; address: Address }
  | { kind: "local"; address: LocalAddress };

const addressSchema = z.object({
  street: z.string().trim().min(2, STRINGS.address.streetRequired),
  city: z.string().trim().min(2, STRINGS.address.townRequired),
  landmark: z.string().trim().optional(),
  postal_code: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

function composeFormattedAddress(parts: {
  street: string;
  landmark?: string;
  city: string;
  region: string;
}): string {
  return [parts.street, parts.landmark, parts.city, parts.region]
    .filter(Boolean)
    .join(", ");
}

function AddressListSkeleton() {
  return (
    <div>
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          className="flex items-center gap-3 border-b border-border/50 py-3.5"
        >
          <Skeleton className="size-9 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

type AddressSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rendered as the sheet's own trigger so the primitive manages focus. */
  trigger?: React.ReactNode;
};

/**
 * Delivery-address picker. Signed-in customers pick from their saved addresses;
 * guests get a single address kept on this device, exactly as on mobile.
 *
 * The body only mounts while the sheet is open, so its mode and form state start
 * fresh on every open instead of carrying over an abandoned entry.
 */
export function AddressSheet({
  open,
  onOpenChange,
  trigger,
}: AddressSheetProps) {
  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={STRINGS.address.sheetTitle}
      hideTitle
    >
      {open ? <AddressSheetBody onClose={() => onOpenChange(false)} /> : null}
    </ResponsiveSheet>
  );
}

function AddressSheetBody({ onClose }: { onClose: () => void }) {
  const user = useUserStore((state) => state.user);
  const isAuthenticated = Boolean(user);

  const { data: backendAddresses = [], isLoading } = useGetAddresses({
    enabled: isAuthenticated,
  });
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId);
  const localAddress = useAddressStore((state) => state.localAddress);
  const isLocalSelected = useAddressStore((state) => state.isLocalSelected);
  const selectAddress = useAddressStore((state) => state.selectAddress);
  const setLocalAddress = useAddressStore((state) => state.setLocalAddress);
  const selectLocalAddress = useAddressStore(
    (state) => state.selectLocalAddress,
  );
  const createAddress = useCreateAddress();

  const persistedCity = useOnboardingStore((state) => state.city);
  const setOnboardingCity = useOnboardingStore((state) => state.setCity);

  const [mode, setMode] = React.useState<"list" | "form">("list");
  const [cityPickerOpen, setCityPickerOpen] = React.useState(false);

  const entries: ListEntry[] = React.useMemo(() => {
    const local: ListEntry[] = localAddress
      ? [{ kind: "local", address: localAddress }]
      : [];
    if (!isAuthenticated) return local;
    return [
      ...local,
      ...backendAddresses.map(
        (address): ListEntry => ({ kind: "saved", address }),
      ),
    ];
  }, [backendAddresses, isAuthenticated, localAddress]);

  const effectiveMode = entries.length === 0 && !isLoading ? "form" : mode;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      city: persistedCity ?? "",
      landmark: "",
      postal_code: "",
      phone: "",
    },
  });

  const city = useWatch({ control, name: "city" });

  const close = onClose;

  const onSubmit = (data: AddressFormData) => {
    if (data.city && data.city !== persistedCity) {
      setOnboardingCity(data.city);
    }

    const payload = {
      street: data.street,
      city: data.city,
      region: DEFAULT_REGION,
      country: DEFAULT_COUNTRY,
      formatted_address: composeFormattedAddress({
        street: data.street,
        landmark: data.landmark || undefined,
        city: data.city,
        region: DEFAULT_REGION,
      }),
      landmark: data.landmark || undefined,
      postal_code: data.postal_code || undefined,
      phone: data.phone || undefined,
    };

    if (!isAuthenticated) {
      setLocalAddress(payload);
      close();
      return;
    }

    createAddress.mutate(
      { ...payload, is_default: false },
      {
        onSuccess: (address) => {
          selectAddress(address.id);
          close();
        },
        onError: () => toast.error(STRINGS.address.createErrorToast),
      },
    );
  };

  const handleSelect = (entry: ListEntry) => {
    if (entry.kind === "local") {
      selectLocalAddress();
    } else {
      selectAddress(entry.address.id);
    }
    close();
  };

  const isEntrySelected = (entry: ListEntry) =>
    entry.kind === "local"
      ? isLocalSelected
      : entry.address.id === selectedAddressId;

  return (
    <>
      <div className="px-5 pb-3">
        <Text variant="h3">
          {effectiveMode === "list"
            ? STRINGS.address.sheetTitle
            : STRINGS.address.addNewAddress}
        </Text>
      </div>
      <div className="px-5">
        <div className="border-t border-border/60" />
      </div>
      <div className="px-5 pt-4 pb-6">
        {effectiveMode === "list" ? (
          <div>
            {isAuthenticated && isLoading ? (
              <AddressListSkeleton />
            ) : (
              entries.map((entry) => {
                const isSelected = isEntrySelected(entry);
                const key =
                  entry.kind === "local" ? "local-address" : entry.address.id;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelect(entry)}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-border/50 py-3.5 text-left",
                      pressableScale,
                      focusRing,
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <MapPin size={16} className="text-primary" aria-hidden />
                    </span>
                    <span className="flex flex-1 flex-col gap-0.5">
                      <Text as="span" variant="body-strong">
                        {entry.address.street}
                      </Text>
                      <Text
                        as="span"
                        variant="body-small"
                        className="truncate text-muted-foreground"
                      >
                        {[
                          entry.address.city,
                          entry.address.landmark,
                          entry.kind === "local"
                            ? STRINGS.address.savedOnDevice
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </Text>
                    </span>
                    {isSelected && (
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Check
                          size={13}
                          strokeWidth={3}
                          className="text-primary-foreground"
                          aria-hidden
                        />
                      </span>
                    )}
                  </button>
                );
              })
            )}

            <button
              type="button"
              onClick={() => setMode("form")}
              className={cn(
                "mt-3 flex w-full items-center gap-3 py-3 text-left",
                pressableScale,
                focusRing,
              )}
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/10">
                <Plus size={16} className="text-primary" aria-hidden />
              </span>
              <Text as="span" variant="body-strong" className="text-primary">
                {STRINGS.address.addNewAddress}
              </Text>
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3.5"
            noValidate
          >
            {entries.length > 0 && (
              <button
                type="button"
                onClick={() => setMode("list")}
                className={cn(
                  "-ml-2 flex size-12 items-center justify-center rounded-full",
                  pressableScale,
                  focusRing,
                )}
                aria-label={STRINGS.common.back}
              >
                <ChevronLeft size={20} className="text-foreground" aria-hidden />
              </button>
            )}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="address-street"
                className="font-sans text-sm font-medium text-muted-foreground"
              >
                {STRINGS.address.streetLabel}
              </label>
              <Input
                id="address-street"
                autoComplete="address-line1"
                placeholder={STRINGS.address.streetPlaceholder}
                aria-invalid={Boolean(errors.street)}
                {...register("street")}
              />
              {errors.street?.message && (
                <Text variant="body-small" className="text-destructive">
                  {errors.street.message}
                </Text>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-sans text-sm font-medium text-muted-foreground">
                {STRINGS.address.townLabel}
              </span>
              <button
                type="button"
                onClick={() => setCityPickerOpen((isOpen) => !isOpen)}
                aria-expanded={cityPickerOpen}
                className={cn(
                  "flex h-12 items-center justify-between rounded-full border-[1.5px] border-input bg-card px-5",
                  pressableScale,
                  focusRing,
                  errors.city && "border-destructive",
                )}
              >
                <span
                  className={cn(
                    "font-sans text-base",
                    city ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {city || STRINGS.address.chooseTown}
                </span>
                <ChevronDown
                  size={16}
                  className="text-muted-foreground"
                  aria-hidden
                />
              </button>
              {cityPickerOpen && (
                <div className="max-h-64 overflow-y-auto rounded-card border border-border px-3">
                  <CityRowList
                    selected={city || null}
                    onSelect={(selected) => {
                      setValue("city", selected, { shouldValidate: true });
                      setCityPickerOpen(false);
                    }}
                  />
                </div>
              )}
              {errors.city?.message && (
                <Text variant="body-small" className="text-destructive">
                  {errors.city.message}
                </Text>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="address-landmark"
                className="font-sans text-sm font-medium text-muted-foreground"
              >
                {STRINGS.address.landmarkLabel}
              </label>
              <Input
                id="address-landmark"
                placeholder={STRINGS.address.landmarkPlaceholder}
                {...register("landmark")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="address-postal"
                className="font-sans text-sm font-medium text-muted-foreground"
              >
                {STRINGS.address.postalCodeLabel}
              </label>
              <Input
                id="address-postal"
                autoComplete="postal-code"
                placeholder={STRINGS.address.postalCodePlaceholder}
                {...register("postal_code")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="address-phone"
                className="font-sans text-sm font-medium text-muted-foreground"
              >
                {STRINGS.address.phoneLabel}
              </label>
              <Input
                id="address-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={STRINGS.address.phonePlaceholder}
                {...register("phone")}
              />
            </div>

            <Button
              type="submit"
              className="mt-2"
              isLoading={createAddress.isPending}
            >
              {STRINGS.address.saveAddress}
            </Button>
          </form>
        )}
      </div>
    </>
  );
}
