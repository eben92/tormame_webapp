"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Text } from "@/components/ui/text";
import type { Address } from "@/lib/api/schemas/account";
import {
  useCreateAddress,
  useUpdateAddress,
} from "@/lib/api/services/addresses";
import { STRINGS } from "@/lib/strings";

const DEFAULT_REGION = "Eastern Region";
const DEFAULT_COUNTRY = "Ghana";

const addressFormSchema = z.object({
  street: z.string().trim().min(2, STRINGS.address.streetRequired),
  city: z.string().trim().min(2, STRINGS.address.townRequired),
  landmark: z.string().trim().optional(),
  postal_code: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  is_default: z.boolean(),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

function composeFormattedAddress(parts: {
  street: string;
  landmark?: string;
  city: string;
}): string {
  return [parts.street, parts.landmark, parts.city, DEFAULT_REGION]
    .filter(Boolean)
    .join(", ");
}

/** Full address form used by the saved-addresses screen for both add and edit. */
export function AddressFormSheet({
  address,
  open,
  onOpenChange,
}: {
  address?: Address;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={address ? STRINGS.address.editTitle : STRINGS.address.addNewAddress}
    >
      {open ? (
        <AddressFormBody
          address={address}
          onClose={() => onOpenChange(false)}
        />
      ) : null}
    </ResponsiveSheet>
  );
}

function AddressFormBody({
  address,
  onClose,
}: {
  address?: Address;
  onClose: () => void;
}) {
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const isEdit = Boolean(address);
  const isPending = isEdit ? updateAddress.isPending : createAddress.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    // The body mounts fresh on every open, so defaults are seeded once here.
    defaultValues: {
      street: address?.street ?? "",
      city: address?.city ?? "",
      landmark: address?.landmark ?? "",
      postal_code: address?.postal_code ?? "",
      phone: address?.phone ?? "",
      is_default: address?.is_default ?? false,
    },
  });

  const isDefault = useWatch({ control, name: "is_default" });

  const onSubmit = (data: AddressFormData) => {
    const payload = {
      street: data.street,
      city: data.city,
      region: DEFAULT_REGION,
      country: DEFAULT_COUNTRY,
      formatted_address: composeFormattedAddress({
        street: data.street,
        landmark: data.landmark || undefined,
        city: data.city,
      }),
      landmark: data.landmark || undefined,
      postal_code: data.postal_code || undefined,
      phone: data.phone || undefined,
      is_default: data.is_default,
    };

    if (address) {
      updateAddress.mutate(
        { id: address.id, ...payload },
        {
          onSuccess: () => {
            toast.success(STRINGS.address.addressUpdatedToast);
            onClose();
          },
          onError: () => toast.error(STRINGS.address.updateErrorToast),
        },
      );
      return;
    }

    createAddress.mutate(
      { ...payload, is_default: false },
      {
        onSuccess: () => {
          toast.success(STRINGS.address.addressAddedToast);
          onClose();
        },
        onError: () => toast.error(STRINGS.address.createErrorToast),
      },
    );
  };

  const field = (
    id: keyof AddressFormData,
    label: string,
    placeholder: string,
    extra?: React.ComponentProps<"input">,
  ) => (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={`address-${id}`}
        className="font-sans text-sm font-medium text-muted-foreground"
      >
        {label}
      </label>
      <Input
        id={`address-${id}`}
        placeholder={placeholder}
        aria-invalid={Boolean(errors[id])}
        {...extra}
        {...register(id)}
      />
      {errors[id]?.message ? (
        <Text variant="body-small" className="text-destructive">
          {String(errors[id]?.message)}
        </Text>
      ) : null}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3.5 px-5 pt-2 pb-6"
      noValidate
    >
      {field("street", STRINGS.address.streetLabel, STRINGS.address.streetPlaceholder, {
        autoComplete: "address-line1",
      })}
      {field("city", STRINGS.address.townLabel, STRINGS.address.townPlaceholder, {
        autoComplete: "address-level2",
      })}
      {field(
        "landmark",
        STRINGS.address.landmarkLabel,
        STRINGS.address.landmarkPlaceholder,
      )}
      {field(
        "postal_code",
        STRINGS.address.postalCodeLabel,
        STRINGS.address.postalCodePlaceholder,
        { autoComplete: "postal-code" },
      )}
      {field("phone", STRINGS.address.phoneLabel, STRINGS.address.phonePlaceholder, {
        type: "tel",
        inputMode: "tel",
        autoComplete: "tel",
      })}

      {isEdit ? (
        <label className="flex min-h-12 cursor-pointer items-center gap-2">
          <Checkbox
            checked={isDefault}
            onCheckedChange={(checked) =>
              setValue("is_default", checked === true)
            }
          />
          <Text as="span" variant="body-small">
            {STRINGS.address.setDefaultLabel}
          </Text>
        </label>
      ) : null}

      <Button type="submit" className="mt-2" isLoading={isPending}>
        {isEdit ? STRINGS.address.saveChanges : STRINGS.address.saveAddress}
      </Button>
    </form>
  );
}
