"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Textarea } from "@/components/ui/input";
import { focusRing } from "@/components/ui/pressable";
import type { OrderRating } from "@/lib/api/schemas/order";
import { useSubmitOrderRating } from "@/lib/api/services/orders";
import { STRINGS } from "@/lib/strings";
import { cn } from "@/lib/utils";

const STAR_VALUES = [1, 2, 3, 4, 5];

export function StarPicker({
  value,
  onChange,
  size = 28,
  readOnly = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {STAR_VALUES.map((star) => {
        const filled = star <= value;
        const icon = (
          <Star
            size={size}
            className={cn(
              filled ? "fill-accent text-accent" : "fill-transparent text-border",
            )}
            aria-hidden
          />
        );

        if (readOnly) {
          return (
            <span key={star} aria-hidden>
              {icon}
            </span>
          );
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            aria-label={STRINGS.orderDetails.rateStarLabel(star)}
            aria-pressed={filled}
            // Fixed 48px target regardless of the visual star size.
            className={cn(
              "flex min-h-12 min-w-12 items-center justify-center rounded-full",
              focusRing,
            )}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}

export function RatingSheet({
  orderId,
  existingRating,
  open,
  onOpenChange,
}: {
  orderId: string;
  existingRating: OrderRating | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const submitRating = useSubmitOrderRating(orderId);
  const [rating, setRating] = React.useState(existingRating?.rating ?? 0);
  const [comment, setComment] = React.useState(existingRating?.comment ?? "");

  const isEdit = Boolean(existingRating);

  const handleSubmit = () => {
    if (rating === 0) return;
    submitRating.mutate(
      { rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(
            isEdit
              ? STRINGS.orderDetails.ratingUpdatedToast
              : STRINGS.orderDetails.ratingSubmittedToast,
          );
          onOpenChange(false);
        },
        onError: () => toast.error(STRINGS.orderDetails.ratingErrorToast),
      },
    );
  };

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={
        isEdit
          ? STRINGS.orderDetails.editRating
          : STRINGS.orderDetails.rateThisOrder
      }
    >
      <div className="flex flex-col gap-4 px-5 pt-2 pb-6">
        <StarPicker value={rating} onChange={setRating} />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="rating-comment"
            className="font-sans text-sm font-medium text-muted-foreground"
          >
            {STRINGS.orderDetails.commentLabel}
          </label>
          <Textarea
            id="rating-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={STRINGS.orderDetails.commentPlaceholder}
          />
        </div>

        <Button
          size="lg"
          dimmed={rating === 0}
          isLoading={submitRating.isPending}
          onClick={handleSubmit}
        >
          {submitRating.isPending
            ? STRINGS.orderDetails.submittingRating
            : isEdit
              ? STRINGS.orderDetails.updateRating
              : STRINGS.orderDetails.submitRating}
        </Button>
      </div>
    </ResponsiveSheet>
  );
}
