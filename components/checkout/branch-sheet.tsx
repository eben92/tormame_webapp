"use client";

import { Check, MapPin } from "lucide-react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { focusRing, pressableScale } from "@/components/ui/pressable";
import { useGetBranches } from "@/lib/api/services/branches";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";
import { useCheckoutStore } from "@/stores/checkout";

function BranchListSkeleton() {
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
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BranchSheet({
  companyId,
  open,
  onOpenChange,
}: {
  companyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: branches = [], isLoading } = useGetBranches(companyId);
  const selectedBranchId = useCheckoutStore((state) => state.selectedBranchId);
  const selectBranch = useCheckoutStore((state) => state.selectBranch);

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={STRINGS.branch.sheetTitle}
    >
      <div className="px-5">
        <div className="border-t border-border/60" />
      </div>
      <div className="px-5 pt-2 pb-6">
        {isLoading ? (
          <BranchListSkeleton />
        ) : (
          branches.map((branch) => {
            const isSelected = branch.id === selectedBranchId;
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => {
                  selectBranch(branch.id);
                  onOpenChange(false);
                }}
                aria-pressed={isSelected}
                aria-label={STRINGS.branch.selectLabel(branch.name)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-border/50 py-3.5 text-left",
                  pressableScale,
                  focusRing,
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <MapPin size={16} className="text-primary" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Text as="span" variant="body-strong">
                    {branch.name}
                  </Text>
                  <Text
                    as="span"
                    variant="body-small"
                    className="truncate text-muted-foreground"
                  >
                    {branch.formatted_address || branch.city}
                  </Text>
                </span>
                {isSelected ? (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Check
                      size={13}
                      strokeWidth={3}
                      className="text-primary-foreground"
                      aria-hidden
                    />
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </ResponsiveSheet>
  );
}
