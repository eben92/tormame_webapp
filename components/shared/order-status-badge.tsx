import { Badge } from "@/components/ui/badge";
import { getOrderStatusInfo, type OrderStatusTone } from "@/lib/order-status";
import { cn } from "@/lib/utils";

/** Tone → token classes, shared by this pill and the order-details status banner. */
export const ORDER_STATUS_TONE_BG: Record<OrderStatusTone, string> = {
  progress: "bg-primary-soft",
  success: "bg-primary-soft",
  warning: "bg-warning/10",
  error: "bg-destructive/10",
};

export const ORDER_STATUS_TONE_TEXT: Record<OrderStatusTone, string> = {
  progress: "text-primary",
  success: "text-primary",
  warning: "text-warning",
  error: "text-destructive",
};

export function OrderStatusBadge({ status }: { status: string }) {
  const info = getOrderStatusInfo(status);
  return (
    <Badge
      className={cn(
        ORDER_STATUS_TONE_BG[info.tone],
        ORDER_STATUS_TONE_TEXT[info.tone],
      )}
    >
      {info.label}
    </Badge>
  );
}
