"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AddressFormSheet } from "@/components/profile/address-form-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";
import { EmptyState, ErrorState, SkeletonRow } from "@/components/ui/states";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import type { Address } from "@/lib/api/schemas/account";
import {
  useDeleteAddress,
  useGetAddresses,
} from "@/lib/api/services/addresses";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

export function AddressesScreen() {
  const router = useRouter();
  const { data: addresses = [], isLoading, isError, error, refetch } =
    useGetAddresses();
  const deleteAddress = useDeleteAddress();

  const [editing, setEditing] = React.useState<Address | undefined>(undefined);
  const [formOpen, setFormOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<Address | null>(null);

  const openAdd = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditing(address);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col">
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
        <Text variant="h3">{STRINGS.profile.menu.savedAddresses}</Text>
      </div>

      <div className="mx-auto flex w-full max-w-[52rem] flex-1 flex-col gap-3 p-4 md:px-8">
        {isLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : addresses.length === 0 ? (
          <EmptyState
            art="addresses"
            title={STRINGS.empty.addresses.title}
            action={{ label: STRINGS.empty.addresses.action, onClick: openAdd }}
          />
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {addresses.map((address) => (
                <li
                  key={address.id}
                  className="flex items-center gap-3 rounded-card border border-border bg-card p-4"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                    <MapPin size={18} className="text-primary" aria-hidden />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      <Text as="span" variant="body-strong" className="truncate">
                        {address.street}
                      </Text>
                      {address.is_default ? (
                        <Badge>{STRINGS.profile.addresses.defaultBadge}</Badge>
                      ) : null}
                    </span>
                    <Text
                      as="span"
                      variant="body-small"
                      className="truncate text-muted-foreground"
                    >
                      {address.formatted_address}
                    </Text>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEdit(address)}
                    aria-label={STRINGS.profile.addresses.editLabel(address.street)}
                    className={cn(
                      "flex size-12 items-center justify-center rounded-full text-muted-foreground hover:bg-muted",
                      pressableScale,
                      focusRing,
                    )}
                  >
                    <Pencil size={18} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(address)}
                    aria-label={STRINGS.profile.addresses.removeLabel(address.street)}
                    className={cn(
                      "flex size-12 items-center justify-center rounded-full text-destructive hover:bg-destructive/10",
                      pressableScale,
                      focusRing,
                    )}
                  >
                    <Trash2 size={18} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>

            <Button variant="outline" onClick={openAdd} className="mt-2 text-primary">
              <Plus size={18} aria-hidden />
              {STRINGS.profile.addresses.addCta}
            </Button>
          </>
        )}
      </div>

      <AddressFormSheet
        address={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {STRINGS.profile.addresses.deleteConfirmTitle}
            </DialogTitle>
            <DialogDescription>
              {pendingDelete?.formatted_address}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              {STRINGS.common.cancel}
            </Button>
            <Button
              variant="destructive"
              isLoading={deleteAddress.isPending}
              onClick={() => {
                if (!pendingDelete) return;
                deleteAddress.mutate(pendingDelete.id, {
                  onSuccess: () => setPendingDelete(null),
                  onError: () =>
                    toast.error(STRINGS.profile.addresses.deleteErrorToast),
                });
              }}
            >
              {STRINGS.profile.addresses.removeAction}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
